/**
 * Generate all voice-coaching audio for First Hour with the Gemini TTS API.
 *
 *   npm run voice                 generate every missing clip (resumable)
 *   npm run voice -- --force      regenerate everything
 *   npm run voice -- --only wgs   regenerate only files whose name matches "wgs"
 *   npm run voice -- --dry-run    list what would be generated, no API calls
 *
 * Source of truth is the app's own data layer: we walk buildTimeline() for both
 * routines and generate exactly the lines the app will request at runtime, named
 * by the shared audioRelPath() helper — so the script and the engine can never
 * disagree about where a clip lives.
 *
 * Env (scripts read .env automatically):
 *   GEMINI_API_KEY   required
 *   GEMINI_TTS_MODEL default gemini-2.5-flash-preview-tts
 *   GEMINI_VOICE     default Charon (deep, calm, male)
 *   GEMINI_TTS_RPM   default 8   (requests per minute throttle)
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import lame from '@breezystack/lamejs';
import { buildTimeline } from '../src/lib/session/timeline.ts';
import { routines } from '../src/data/routines.ts';
import { audioRelPath } from '../src/lib/voice/audioKey.ts';
import type { VoiceLineRequest } from '../src/lib/voice/VoiceEngine.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');
const AUDIO_DIR = join(PUBLIC, 'audio');
const MANIFEST = join(AUDIO_DIR, 'manifest.json');

const SAMPLE_RATE = 24000; // Gemini TTS returns 24kHz 16-bit mono PCM (L16)
const MP3_KBPS = 64;
const TARGET_DBFS = -16; // ~ -16 LUFS for speech after silence gating
const PEAK_CEILING_DBFS = -1;
const TRIM_PAD_MS = 60;
// The "slow, unhurried, murmur" style makes the model insert 1–2s pauses
// between sentences. Keep natural pauses, cap the dead air.
const MAX_INTERNAL_SILENCE_MS = 340;
const SILENCE_DBFS = -45;

const STYLE_PROMPT =
  'Speak as a calm, low-key Australian fitness coach guiding someone through gentle ' +
  'early-morning movement. Quiet, unhurried, slightly warm, almost a murmur — like ' +
  'talking to someone who just woke up. Flat, matter-of-fact delivery. No enthusiasm, ' +
  'no announcer energy. Slight downward inflection at the end of each line. Pace: slow.';

// ── env / args ──────────────────────────────────────────────────────────────
function loadEnv() {
  const p = join(ROOT, '.env');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts';
const VOICE = process.env.GEMINI_VOICE || 'Charon';
const RPM = Math.max(1, Number(process.env.GEMINI_TTS_RPM) || 8);
const MIN_GAP_MS = Math.ceil(60000 / RPM);

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const DRY_RUN = args.includes('--dry-run');
const onlyIdx = args.indexOf('--only');
const ONLY = onlyIdx >= 0 ? args[onlyIdx + 1] : null;

// ── target set (exactly what the app will request) ───────────────────────────
interface Target {
  path: string; // relative to public/, e.g. audio/daily-10/glute-bridge-start.mp3
  text: string;
  routineId: string;
}

function collectTargets(): Target[] {
  const byPath = new Map<string, Target>();
  for (const routine of routines) {
    for (const event of buildTimeline(routine)) {
      for (const v of event.voice as VoiceLineRequest[]) {
        const path = audioRelPath(v);
        const existing = byPath.get(path);
        if (existing && existing.text !== v.text) {
          throw new Error(
            `Filename collision: "${path}" maps to two different lines:\n  1) ${existing.text}\n  2) ${v.text}`,
          );
        }
        if (!existing) byPath.set(path, { path, text: v.text, routineId: v.routineId });
      }
    }
  }
  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}

// ── audio processing (no ffmpeg: pure JS) ────────────────────────────────────
function pcmFromBase64(b64: string): Float32Array {
  const buf = Buffer.from(b64, 'base64');
  const n = Math.floor(buf.length / 2);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = buf.readInt16LE(i * 2) / 32768;
  return out;
}

/** Cap runs of near-silence longer than MAX_INTERNAL_SILENCE_MS down to it,
 *  so over-long dramatic pauses don't bloat clips (natural gaps survive). */
function compressInternalSilence(x: Float32Array): Float32Array {
  const thresh = Math.pow(10, SILENCE_DBFS / 20);
  const maxRun = Math.round((MAX_INTERNAL_SILENCE_MS / 1000) * SAMPLE_RATE);
  const out: number[] = [];
  let run = 0;
  for (let i = 0; i < x.length; i++) {
    if (Math.abs(x[i]) < thresh) {
      run++;
      if (run <= maxRun) out.push(x[i]);
    } else {
      run = 0;
      out.push(x[i]);
    }
  }
  return Float32Array.from(out);
}

function trimSilence(x: Float32Array): Float32Array {
  const thresh = Math.pow(10, -40 / 20); // -40 dBFS
  const pad = Math.round((TRIM_PAD_MS / 1000) * SAMPLE_RATE);
  let start = 0;
  let end = x.length - 1;
  while (start < x.length && Math.abs(x[start]) < thresh) start++;
  while (end > start && Math.abs(x[end]) < thresh) end--;
  start = Math.max(0, start - pad);
  end = Math.min(x.length - 1, end + pad);
  return x.subarray(start, end + 1);
}

/** Gated integrated RMS in dBFS — a pragmatic stand-in for BS.1770 loudness on
 *  short single-voice clips (absolute + -10 LU relative gate over 100ms blocks). */
function gatedRmsDbfs(x: Float32Array): number {
  const block = Math.round(0.1 * SAMPLE_RATE);
  const ms: number[] = [];
  for (let i = 0; i + block <= x.length; i += block) {
    let s = 0;
    for (let j = 0; j < block; j++) s += x[i + j] * x[i + j];
    ms.push(s / block);
  }
  if (!ms.length) return -70;
  const absGate = Math.pow(10, -60 / 10); // -60 dB power
  let kept = ms.filter((m) => m > absGate);
  if (!kept.length) kept = ms;
  const mean = kept.reduce((a, b) => a + b, 0) / kept.length;
  const relGate = mean * Math.pow(10, -10 / 10); // -10 LU relative
  let kept2 = kept.filter((m) => m > relGate);
  if (!kept2.length) kept2 = kept;
  const meanMs = kept2.reduce((a, b) => a + b, 0) / kept2.length;
  return 10 * Math.log10(meanMs + 1e-12);
}

function normalize(x: Float32Array): Float32Array {
  const current = gatedRmsDbfs(x);
  let gain = Math.pow(10, (TARGET_DBFS - current) / 20);
  let peak = 0;
  for (const s of x) peak = Math.max(peak, Math.abs(s));
  const ceil = Math.pow(10, PEAK_CEILING_DBFS / 20);
  if (peak * gain > ceil) gain = ceil / (peak || 1);
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) out[i] = Math.max(-1, Math.min(1, x[i] * gain));
  return out;
}

function encodeMp3(x: Float32Array): Buffer {
  const enc = new lame.Mp3Encoder(1, SAMPLE_RATE, MP3_KBPS);
  const int16 = new Int16Array(x.length);
  for (let i = 0; i < x.length; i++) int16[i] = Math.round(x[i] * 32767);
  const chunks: Uint8Array[] = [];
  const CHUNK = 1152;
  for (let i = 0; i < int16.length; i += CHUNK) {
    const buf = enc.encodeBuffer(int16.subarray(i, i + CHUNK));
    if (buf.length) chunks.push(new Uint8Array(buf));
  }
  const tail = enc.flush();
  if (tail.length) chunks.push(new Uint8Array(tail));
  return Buffer.concat(chunks);
}

// ── Gemini TTS ───────────────────────────────────────────────────────────────
interface TtsResult {
  pcm: Float32Array;
  promptTokens: number;
  audioTokens: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function synthesize(text: string): Promise<TtsResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const body = {
    contents: [{ parts: [{ text: `${STYLE_PROMPT}\n\n${text}` }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
    },
  };

  let attempt = 0;
  for (;;) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const json = await res.json();
      const part = json?.candidates?.[0]?.content?.parts?.[0];
      const data = part?.inlineData?.data;
      if (!data) throw new Error(`No audio in response: ${JSON.stringify(json).slice(0, 300)}`);
      const um = json.usageMetadata ?? {};
      return { pcm: pcmFromBase64(data), promptTokens: um.promptTokenCount ?? 0, audioTokens: um.candidatesTokenCount ?? 0 };
    }
    const status = res.status;
    const errText = await res.text();
    // Hard-stop on auth / bad-model / bad-request so the user fixes AI Studio, not silent fallback.
    if (status === 400 || status === 401 || status === 403 || status === 404) {
      throw new FatalApiError(status, errText);
    }
    if ((status === 429 || status >= 500) && attempt < 5) {
      const wait = 2000 * Math.pow(2, attempt);
      attempt++;
      console.warn(`  ${status} — backing off ${wait / 1000}s (retry ${attempt}/5)`);
      await sleep(wait);
      continue;
    }
    throw new Error(`TTS request failed: ${status} ${errText.slice(0, 300)}`);
  }
}

class FatalApiError extends Error {
  status: number;
  detail: string;
  constructor(status: number, detail: string) {
    super(`Gemini API ${status}`);
    this.status = status;
    this.detail = detail;
  }
}

// ── manifest ─────────────────────────────────────────────────────────────────
interface ManifestFile {
  path: string;
  text: string;
  routineId: string;
  durationSec: number;
}
interface Manifest {
  model: string;
  voice: string;
  sampleRate: number;
  generatedAt: string;
  files: ManifestFile[];
}

function readManifest(): Manifest {
  if (existsSync(MANIFEST)) {
    try {
      return JSON.parse(readFileSync(MANIFEST, 'utf8')) as Manifest;
    } catch {
      /* fall through */
    }
  }
  return { model: MODEL, voice: VOICE, sampleRate: SAMPLE_RATE, generatedAt: '', files: [] };
}

function writeManifest(m: Manifest) {
  m.model = MODEL;
  m.voice = VOICE;
  m.sampleRate = SAMPLE_RATE;
  m.generatedAt = new Date().toISOString();
  m.files.sort((a, b) => a.path.localeCompare(b.path));
  writeFileSync(MANIFEST, JSON.stringify(m, null, 2) + '\n');
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!API_KEY) {
    console.error('GEMINI_API_KEY is not set. Add it to .env (see README).');
    process.exit(1);
  }

  const targets = collectTargets();
  const manifest = readManifest();
  const manifestByPath = new Map(manifest.files.map((f) => [f.path, f]));

  const selected = targets.filter((t) => {
    if (ONLY && !t.path.includes(ONLY)) return false;
    return true;
  });
  const toGenerate = selected.filter((t) => {
    const abs = join(PUBLIC, t.path);
    if (FORCE || ONLY) return true;
    return !existsSync(abs); // resumable: skip files already on disk
  });

  const totalChars = selected.reduce((n, t) => n + STYLE_PROMPT.length + 2 + t.text.length, 0);
  console.log(`Model: ${MODEL}   Voice: ${VOICE}   Throttle: ${RPM} req/min`);
  console.log(`Targets: ${targets.length} unique clips   Selected: ${selected.length}   To generate: ${toGenerate.length}`);
  console.log(`Characters that would be sent for the full selected set: ${totalChars.toLocaleString()}`);

  if (DRY_RUN) {
    for (const t of toGenerate) console.log(`  would generate  ${t.path}   "${t.text}"`);
    return;
  }
  if (!toGenerate.length) {
    console.log('Nothing to generate — all selected clips already exist. (use --force to regenerate)');
    // still refresh manifest for any on-disk file missing from it
  }

  let sentChars = 0;
  let promptTokens = 0;
  let audioTokens = 0;
  let done = 0;
  let lastStart = 0;

  for (const t of toGenerate) {
    const gap = MIN_GAP_MS - (Date.now() - lastStart);
    if (gap > 0) await sleep(gap);
    lastStart = Date.now();

    try {
      const { pcm, promptTokens: pt, audioTokens: at } = await synthesize(t.text);
      const processed = normalize(trimSilence(compressInternalSilence(pcm)));
      const mp3 = encodeMp3(processed);
      const abs = join(PUBLIC, t.path);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, mp3);

      const durationSec = Number((processed.length / SAMPLE_RATE).toFixed(2));
      manifestByPath.set(t.path, { path: t.path, text: t.text, routineId: t.routineId, durationSec });
      manifest.files = [...manifestByPath.values()];
      writeManifest(manifest);

      sentChars += STYLE_PROMPT.length + 2 + t.text.length;
      promptTokens += pt;
      audioTokens += at;
      done++;
      console.log(`  [${done}/${toGenerate.length}] ${t.path}  (${durationSec}s, ${(mp3.length / 1024).toFixed(1)}kB)`);
    } catch (err) {
      if (err instanceof FatalApiError) {
        console.error(`\nGemini API rejected the request (HTTP ${err.status}). NOT falling back.`);
        console.error(err.detail.slice(0, 500));
        console.error('\nCheck in Google AI Studio (aistudio.google.com):');
        if (err.status === 400) console.error('  • Model name / request shape — is GEMINI_TTS_MODEL a valid TTS model? Is the voice name valid?');
        if (err.status === 401 || err.status === 403) console.error('  • API key — is GEMINI_API_KEY correct, enabled, and is the Generative Language API turned on for its project?');
        if (err.status === 404) console.error(`  • Model "${MODEL}" not found for this key. List models: GET /v1beta/models.`);
        process.exit(2);
      }
      throw err;
    }
  }

  // Prune manifest entries whose files no longer exist on disk.
  manifest.files = manifest.files.filter((f) => existsSync(join(PUBLIC, f.path)));
  writeManifest(manifest);

  console.log(`\nGenerated ${done} clip(s). Manifest: ${manifest.files.length} files total.`);
  if (done) {
    console.log(`Characters sent this run: ${sentChars.toLocaleString()}`);
    console.log(`Tokens this run — prompt(text): ${promptTokens.toLocaleString()}, audio(output): ${audioTokens.toLocaleString()}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

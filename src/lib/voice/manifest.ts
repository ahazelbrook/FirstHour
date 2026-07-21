import { buildTimeline } from '../session/timeline';
import { routines } from '../../data/routines';
import { audioRelPath } from './audioKey';

export interface ManifestFile {
  path: string;
  text: string;
  routineId: string;
  durationSec: number;
}

export interface VoiceManifest {
  model: string;
  voice: string;
  sampleRate: number;
  generatedAt: string;
  files: ManifestFile[];
}

/** Every audio path the app can request across both routines. */
export function expectedAudioPaths(): string[] {
  const set = new Set<string>();
  for (const routine of routines) {
    for (const event of buildTimeline(routine)) {
      for (const v of event.voice) set.add(audioRelPath(v));
    }
  }
  return [...set];
}

export async function loadManifest(): Promise<VoiceManifest | null> {
  try {
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    const res = await fetch(`${base}/audio/manifest.json`, { cache: 'no-cache' });
    if (!res.ok) return null;
    return (await res.json()) as VoiceManifest;
  } catch {
    return null;
  }
}

export function manifestCompleteness(manifest: VoiceManifest | null) {
  const expected = expectedAudioPaths();
  if (!manifest) return { complete: false, missing: expected, have: 0, expected: expected.length };
  const have = new Set(manifest.files.map((f) => f.path));
  const missing = expected.filter((p) => !have.has(p));
  return { complete: missing.length === 0, missing, have: have.size, expected: expected.length };
}

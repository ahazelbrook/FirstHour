import { useEffect, useMemo, useState } from 'react';
import { VoiceCoach } from './VoiceCoach';
import { SpeechSynthesisEngine } from './SpeechSynthesisEngine';
import { AudioFileEngine } from './AudioFileEngine';
import { loadManifest, manifestCompleteness } from './manifest';

export type VoicePref = 'recorded' | 'device' | 'off';

const PREF_KEY = 'firsthour.voice';

function readPref(): VoicePref | null {
  try {
    const v = localStorage.getItem(PREF_KEY);
    if (v === 'recorded' || v === 'device' || v === 'off') return v;
  } catch {
    /* unavailable */
  }
  return null;
}

function writePref(v: VoicePref) {
  try {
    localStorage.setItem(PREF_KEY, v);
  } catch {
    /* unavailable */
  }
}

/** Loads the audio manifest once and reports whether the recorded set is complete. */
export function useVoiceAvailability() {
  const [state, setState] = useState({ loading: true, recordedAvailable: false, have: 0, expected: 0 });

  useEffect(() => {
    let alive = true;
    void loadManifest().then((manifest) => {
      if (!alive) return;
      const { complete, missing, have, expected } = manifestCompleteness(manifest);
      if (import.meta.env.DEV && missing.length && manifest) {
        console.warn(`[voice] recorded set incomplete — ${missing.length} missing clip(s):`, missing);
      }
      setState({ loading: false, recordedAvailable: complete, have, expected });
    });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

/**
 * Owns the active VoiceCoach and the user's voice preference. Rebuilds the
 * coach when the preference or recorded-availability changes (only happens
 * outside a session), and stops the previous coach cleanly.
 */
export function useVoice(recordedAvailable: boolean) {
  const [pref, setPref] = useState<VoicePref | null>(() => readPref());

  // Default the preference once availability is known and nothing is stored.
  useEffect(() => {
    if (pref === null) setPref(recordedAvailable ? 'recorded' : 'device');
  }, [recordedAvailable, pref]);

  const effective: VoicePref = pref ?? (recordedAvailable ? 'recorded' : 'device');

  const coach = useMemo(() => {
    const useRecorded = effective === 'recorded' && recordedAvailable;
    const engine = useRecorded ? new AudioFileEngine() : new SpeechSynthesisEngine();
    const c = new VoiceCoach(engine);
    c.setMuted(effective === 'off');
    return c;
  }, [effective, recordedAvailable]);

  useEffect(() => () => coach.stop(), [coach]);

  const changePref = (p: VoicePref) => {
    writePref(p);
    setPref(p);
  };

  return { coach, pref: effective, changePref };
}

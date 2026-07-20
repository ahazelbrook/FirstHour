import { useCallback, useMemo, useState } from 'react';
import type { Routine } from './types';
import { SpeechSynthesisEngine } from './lib/voice/SpeechSynthesisEngine';
import { VoiceCoach } from './lib/voice/VoiceCoach';
import { recordCompletion } from './lib/storage';
import { HomeScreen } from './screens/HomeScreen';
import { SessionScreen } from './screens/SessionScreen';
import { CompletionScreen } from './screens/CompletionScreen';
import { InfoScreen } from './screens/InfoScreen';

// To use pre-recorded lines instead of speechSynthesis, swap in AudioFileEngine
// (see README — files go in public/audio/{segmentId}-{event}.mp3).
type View =
  | { name: 'home' }
  | { name: 'info' }
  | { name: 'session'; routine: Routine }
  | { name: 'complete'; routine: Routine; streak: number };

export default function App() {
  const coach = useMemo(() => new VoiceCoach(new SpeechSynthesisEngine()), []);
  const [view, setView] = useState<View>({ name: 'home' });

  const handleComplete = useCallback(
    (routine: Routine) => {
      const streak = recordCompletion();
      setView({ name: 'complete', routine, streak });
    },
    [],
  );

  switch (view.name) {
    case 'home':
      return (
        <HomeScreen
          onStart={(routine) => setView({ name: 'session', routine })}
          onInfo={() => setView({ name: 'info' })}
        />
      );
    case 'info':
      return <InfoScreen onBack={() => setView({ name: 'home' })} />;
    case 'session':
      return (
        <SessionScreen
          routine={view.routine}
          coach={coach}
          onComplete={() => handleComplete(view.routine)}
          onExit={() => setView({ name: 'home' })}
        />
      );
    case 'complete':
      return (
        <CompletionScreen
          routine={view.routine}
          streak={view.streak}
          onDone={() => setView({ name: 'home' })}
        />
      );
  }
}

import { useCallback, useState } from 'react';
import type { Routine } from './types';
import { recordCompletion } from './lib/storage';
import { useVoice, useVoiceAvailability } from './lib/voice/useVoice';
import { HomeScreen } from './screens/HomeScreen';
import { SessionScreen } from './screens/SessionScreen';
import { CompletionScreen } from './screens/CompletionScreen';
import { InfoScreen } from './screens/InfoScreen';

type View =
  | { name: 'home' }
  | { name: 'info' }
  | { name: 'session'; routine: Routine }
  | { name: 'complete'; routine: Routine; streak: number };

export default function App() {
  const { recordedAvailable } = useVoiceAvailability();
  const { coach, pref, changePref } = useVoice(recordedAvailable);
  const [view, setView] = useState<View>({ name: 'home' });

  const handleComplete = useCallback((routine: Routine) => {
    const streak = recordCompletion();
    setView({ name: 'complete', routine, streak });
  }, []);

  switch (view.name) {
    case 'home':
      return (
        <HomeScreen
          onStart={(routine) => setView({ name: 'session', routine })}
          onInfo={() => setView({ name: 'info' })}
          voicePref={pref}
          onChangeVoicePref={changePref}
          recordedAvailable={recordedAvailable}
        />
      );
    case 'info':
      return <InfoScreen onBack={() => setView({ name: 'home' })} />;
    case 'session':
      return (
        <SessionScreen
          routine={view.routine}
          coach={coach}
          voiceOff={pref === 'off'}
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

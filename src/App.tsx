import { useCallback, useState } from 'react';
import type { Routine } from './types';
import { recordCompletion } from './lib/storage';
import { useVoice, useVoiceAvailability } from './lib/voice/useVoice';
import { GradientMesh } from './components/GradientMesh';
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

  let screen;
  switch (view.name) {
    case 'home':
      screen = (
        <HomeScreen
          onStart={(routine) => setView({ name: 'session', routine })}
          onInfo={() => setView({ name: 'info' })}
          voicePref={pref}
          onChangeVoicePref={changePref}
          recordedAvailable={recordedAvailable}
        />
      );
      break;
    case 'info':
      screen = <InfoScreen onBack={() => setView({ name: 'home' })} />;
      break;
    case 'session':
      screen = (
        <SessionScreen
          routine={view.routine}
          coach={coach}
          voiceOff={pref === 'off'}
          onComplete={() => handleComplete(view.routine)}
          onExit={() => setView({ name: 'home' })}
        />
      );
      break;
    case 'complete':
      screen = (
        <CompletionScreen
          routine={view.routine}
          streak={view.streak}
          onDone={() => setView({ name: 'home' })}
        />
      );
      break;
  }

  return (
    <>
      <GradientMesh />
      <div className="relative z-10">{screen}</div>
    </>
  );
}

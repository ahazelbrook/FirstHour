import { useEffect, useRef, useState } from 'react';
import { WakeLockController, type WakeLockStatus } from './wakeLock';

/** Hold a screen wake lock while `active`; reports status for the fallback hint. */
export function useWakeLock(active: boolean): WakeLockStatus | null {
  const [status, setStatus] = useState<WakeLockStatus | null>(null);
  const controllerRef = useRef<WakeLockController | null>(null);

  useEffect(() => {
    if (!active) return;
    const controller = new WakeLockController();
    controllerRef.current = controller;
    controller.onStatusChange = setStatus;
    void controller.request();

    const onVisibility = () => void controller.handleVisibilityChange();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      controller.onStatusChange = null;
      void controller.release();
      controllerRef.current = null;
      setStatus(null);
    };
  }, [active]);

  return status;
}

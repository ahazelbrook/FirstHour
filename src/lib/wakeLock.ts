export type WakeLockStatus = 'active' | 'unsupported' | 'released' | 'error';

/** Thin wrapper over the Screen Wake Lock API with re-acquire on visibility change. */
export class WakeLockController {
  private sentinel: WakeLockSentinel | null = null;
  private wanted = false;
  onStatusChange: ((status: WakeLockStatus) => void) | null = null;

  private supported() {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  }

  private emit(status: WakeLockStatus) {
    this.onStatusChange?.(status);
  }

  async request(): Promise<void> {
    this.wanted = true;
    if (!this.supported()) {
      this.emit('unsupported');
      return;
    }
    try {
      this.sentinel = await navigator.wakeLock.request('screen');
      this.emit('active');
      this.sentinel.addEventListener('release', () => {
        if (this.wanted) this.emit('released');
      });
    } catch {
      this.emit('error');
    }
  }

  async release(): Promise<void> {
    this.wanted = false;
    try {
      await this.sentinel?.release();
    } catch {
      // already released
    }
    this.sentinel = null;
  }

  /** Call on visibilitychange — wake locks are auto-released when the tab backgrounds. */
  async handleVisibilityChange(): Promise<void> {
    if (this.wanted && document.visibilityState === 'visible' && !this.sentinel) {
      await this.request();
    }
  }
}

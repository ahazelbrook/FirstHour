const KEY = 'firsthour.v1';

interface Stored {
  streak: number;
  lastDate: string; // local YYYY-MM-DD of last completed session
  totalSessions: number;
}

function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDateKey(d);
}

function read(): Stored {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Stored;
  } catch {
    // corrupted or unavailable — start fresh
  }
  return { streak: 0, lastDate: '', totalSessions: 0 };
}

function write(data: Stored) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // storage full/unavailable — streaks are nice-to-have, never fatal
  }
}

/** Current streak, counting today or a still-alive run ending yesterday. */
export function getStreak(): number {
  const data = read();
  if (data.lastDate === localDateKey() || data.lastDate === yesterdayKey()) return data.streak;
  return 0;
}

export function hasCompletedToday(): boolean {
  return read().lastDate === localDateKey();
}

/** Record a finished session; idempotent per day. Returns the updated streak. */
export function recordCompletion(): number {
  const data = read();
  const today = localDateKey();
  if (data.lastDate === today) return data.streak;
  const streak = data.lastDate === yesterdayKey() ? data.streak + 1 : 1;
  write({ streak, lastDate: today, totalSessions: data.totalSessions + 1 });
  return streak;
}

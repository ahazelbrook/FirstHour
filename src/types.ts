export interface SegmentVoice {
  /** Spoken the moment the segment begins. */
  start: string;
  /** Spoken once, roughly 40% into the segment. */
  mid: string;
  /** Spoken with 5 seconds left in the segment. */
  tMinus5: string;
  /** Spoken at the halfway point of a perSide segment. */
  switchSides?: string;
}

export interface Segment {
  id: string;
  name: string;
  startSec: number;
  endSec: number;
  prescription: string;
  /** The coaching cue shown on screen and spoken mid-segment. */
  cue: string;
  perSide?: boolean;
  voice: SegmentVoice;
}

export interface Block {
  id: string;
  name: string;
  /** Spoken once, when the block's first segment starts. */
  voiceIntro: string;
  segments: Segment[];
}

export interface Routine {
  id: 'daily-10' | 'extended-20' | 'routine-a' | 'routine-b';
  title: string;
  subtitle: string;
  totalSec: number;
  blocks: Block[];
  /** Spoken over the first segment, session-opening line. */
  voiceSessionStart: string;
  /** Spoken when the final segment ends. */
  voiceSessionEnd: string;
}

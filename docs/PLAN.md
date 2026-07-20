# First Hour — Design Plan

A 5am, dark-room product. Zero decisions, zero reading once started. Voice carries the
session; the screen is glanceable confirmation from 2 metres.

## Palette — "pre-dawn"

Base (fixed):

| Token | Hex | Use |
|---|---|---|
| `night-0` | `#0F0E16` | App background (near-black warm indigo-charcoal, never pure black) |
| `night-1` | `#161420` | Surfaces / cards |
| `night-2` | `#1E1B2A` | Raised surfaces, track lines |
| `cream` | `#EDE6DA` | Primary text (warm off-white, never pure white) |
| `mist` | `#9C94AC` | Secondary text, quiet labels |

Accent (the sunrise — shifts per block, the app's signature). One accent live at a time,
crossfaded over ~1.2s at block boundaries:

| Block | Name | Hex |
|---|---|---|
| 1 Raise | ember | `#F4703B` |
| 2 Mobilise | amber | `#F79A4B` |
| 3 Activate | gold | `#FBBE5A` |
| 4 Potentiate | daylight | `#FFD97E` |

Glow = accent at 18–25% alpha as soft box/drop shadows. No hard glassmorphism. All hues
derive from this ramp; there is no other colour in the app.

## Typography

- **Display / timer numerals: Sono Variable** — warm rounded mono; monospaced digits are
  inherently tabular so the countdown never jitters. Weight ~500 at clamp(72px, 26vw, 200px).
- **Body / cues: Inter Variable** — quiet, maximally legible. Cues at 20–24px.
- Generous tracking on small caps labels (block names, "up next").

## Layout wireframes

Cover screen portrait (~6.3", single column, timer dominant):

```
[ session progress bar + block ticks ]
[ BLOCK n · segment name             ]
[        ◯ COUNTDOWN RING            ]
[            1:23                    ]
[ coaching cue (one line)            ]
[ animated figure                    ]
[ up next: …            (small)      ]
[ ⏮   ⏯ (large)   ⏭    🔇   ✕       ]
```

Unfolded (~8") / desktop: two columns — ring + cue + controls left, figure + up-next right.
Breakpoint: `lg` (1024px) for the split; everything fluid below.

## Sunrise signature

1. **Session start**: one orchestrated dawn-gradient sweep — a radial ember glow rises from
   the bottom edge and dissolves over ~2.6s, then the UI settles and nothing else moves
   decoratively.
2. **Block progression**: `--accent` CSS variable crossfades ember → amber → gold → daylight
   as blocks advance. Ring stroke, cue highlights, progress fill, and glow all consume it —
   the interface literally warms up as you do.
3. `prefers-reduced-motion`: sweep becomes a simple fade; figures show static two-pose
   crossfades; ring updates without spring.

## Voice orchestration policy

- All lines flow through a `VoiceCoach` sequential queue (utterance-completion chained);
  a new segment flushes the queue so speech always cancels cleanly.
- Session intro **replaces** segment 1's start line (spoken over the breathing).
- Block intros queue **before** the segment start line at block boundaries.
- Per-side / phase midpoints: chime + spoken line only — no visual L/R badge
  (`squats-lunges`' midpoint is a phase change, not a side change).
- Catch-up guard: if the clock jumps >3s (tab throttled), stale events are dropped and the
  coach re-orients with the current segment's start line only.

## Model allocation

- **Fable 5**: voice orchestration, session engine + timeline tests, design system,
  session screen (ring/progress/controls), app shell, figure rig + reference animations.
- **Opus 4.8**: all remaining exercise figure animations; Home/Completion/Info polish;
  responsive pass (cover screen / unfolded / desktop).
- **Sonnet 5**: PWA (manifest, service worker, icons), README.
- **Haiku 4.5**: icon asset generation, lint/scripts housekeeping.

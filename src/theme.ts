/** The sunrise ramp — block accent hexes, ember → daylight. Keep in sync with index.css @theme. */
export const BLOCK_ACCENTS = ['#f4703b', '#f79a4b', '#fbbe5a', '#ffd97e'] as const;

export function accentForBlock(blockIndex: number): string {
  return BLOCK_ACCENTS[Math.min(Math.max(blockIndex, 0), BLOCK_ACCENTS.length - 1)];
}

/* ------------------------------------------------------------------ *
 * Swirling gradient-mesh palettes (pre-dawn → golden morning).
 * Each palette drives the five background orbs and the live UI accent.
 * ------------------------------------------------------------------ */
export type MeshPaletteName = 'home' | 'night' | 'dawn' | 'sunrise' | 'morning' | 'gold';

interface MeshPalette {
  orbs: [string, string, string, string, string];
  accent: string;
}

export const MESH_PALETTES: Record<MeshPaletteName, MeshPalette> = {
  night: { orbs: ['#3f3aa6', '#6a54d6', '#8f6fd6', '#4f6ae0', '#7a5ad0'], accent: '#a99bff' },
  dawn: { orbs: ['#6b46c9', '#a95fd0', '#e06fae', '#7d6fe0', '#c77ad0'], accent: '#c99bec' },
  sunrise: { orbs: ['#b5509e', '#e0657f', '#ff8a6e', '#d76fb0', '#ff9e78'], accent: '#ff9e9e' },
  morning: { orbs: ['#e0657f', '#ff8a5c', '#ffb35c', '#ffd06a', '#ff9e78'], accent: '#ffb27a' },
  home: { orbs: ['#5b46c9', '#a95fd0', '#e06fae', '#6d7be0', '#ff9e78'], accent: '#c9a0f0' },
  gold: { orbs: ['#e0657f', '#ff9e5c', '#ffc65c', '#ffe08a', '#ffb27a'], accent: '#ffce6a' },
};

/** Session blocks (Raise → Mobilise → Activate → Potentiate) map onto the sunrise. */
export const BLOCK_MESH: MeshPaletteName[] = ['night', 'dawn', 'sunrise', 'morning'];

export function meshForBlock(blockIndex: number): MeshPaletteName {
  return BLOCK_MESH[Math.min(Math.max(blockIndex, 0), BLOCK_MESH.length - 1)];
}

function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Orb-drift speed: home is calm, a live session is livelier, paused is slowest. */
const DURATIONS: Record<'home' | 'session' | 'paused', number[]> = {
  home: [40, 52, 34, 58, 46],
  session: [22, 28, 18, 30, 24],
  paused: [74, 88, 64, 98, 80],
};

/** CSS custom properties for a palette, applied to <html> by useMeshPalette. */
export function meshVars(
  name: MeshPaletteName,
  mode: 'home' | 'session' | 'paused' = 'home',
): Record<string, string> {
  const p = MESH_PALETTES[name];
  const d = DURATIONS[mode];
  return {
    '--fh-b1': p.orbs[0],
    '--fh-b2': p.orbs[1],
    '--fh-b3': p.orbs[2],
    '--fh-b4': p.orbs[3],
    '--fh-b5': p.orbs[4],
    '--fh-d1': `${d[0]}s`,
    '--fh-d2': `${d[1]}s`,
    '--fh-d3': `${d[2]}s`,
    '--fh-d4': `${d[3]}s`,
    '--fh-d5': `${d[4]}s`,
    '--accent': p.accent,
    '--accent-glow': hexToRgba(p.accent, 0.22),
    '--accent-glow-strong': hexToRgba(p.accent, 0.5),
  };
}

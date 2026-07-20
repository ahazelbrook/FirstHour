/** The sunrise ramp — block accent hexes, ember → daylight. Keep in sync with index.css @theme. */
export const BLOCK_ACCENTS = ['#f4703b', '#f79a4b', '#fbbe5a', '#ffd97e'] as const;

export function accentForBlock(blockIndex: number): string {
  return BLOCK_ACCENTS[Math.min(Math.max(blockIndex, 0), BLOCK_ACCENTS.length - 1)];
}

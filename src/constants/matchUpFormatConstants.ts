export const NORMAL = 'normal';
export const TIMED = 'timed';
export const FINAL = 'final';
export const NOAD = 'NOAD';
export const SET = 'SET';

// Multi-root support for cross-sport scalability
export const MATCH_ROOTS = ['SET', 'HAL', 'QTR', 'PER', 'INN', 'RND', 'FRM', 'MAP', 'MAT'] as const;
export type MatchRoot = (typeof MATCH_ROOTS)[number];

// Game format types
export const CONSECUTIVE = 'CONSECUTIVE';
export const TRADITIONAL = 'TRADITIONAL';

export const sectionTypes = {
  S: NORMAL,
  F: FINAL,
  G: 'game',
};

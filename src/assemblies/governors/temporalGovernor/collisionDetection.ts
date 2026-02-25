/**
 * Collision Detection & Clamping
 *
 * Implements collision-aware clamping for drag-create operations.
 *
 * Core Principles:
 * - Half-open intervals: [start, end) where start < end
 * - Adjacency allowed: end === start is valid (not an overlap)
 * - No overlaps permitted: intervals cannot share internal time points
 * - Clamping: new blocks stop at the first collision boundary
 *
 * Rules:
 * A. Drag outside -> enters block -> clamp to boundary
 * B. Drag starts inside block -> invalid, do not create
 * C. Drag spans multiple blocks -> create first valid segment only
 */

import type { Block, TimeRange } from './types';

/**
 * Check if two time intervals overlap
 * Adjacency is NOT overlap (touching boundaries are allowed)
 *
 * Intervals: A=[aStart, aEnd), B=[bStart, bEnd)
 * Overlap iff: aStart < bEnd AND aEnd > bStart
 *
 * @param a First interval
 * @param b Second interval
 * @returns true if intervals overlap (share internal time points)
 */
export function intervalsOverlap(a: TimeRange, b: TimeRange): boolean {
  const aStart = new Date(a.start?.endsWith('Z') ? a.start : a.start + 'Z').getTime();
  const aEnd = new Date(a.end?.endsWith('Z') ? a.end : a.end + 'Z').getTime();
  const bStart = new Date(b?.start?.endsWith('Z') ? b?.start : b?.start + 'Z').getTime();
  const bEnd = new Date(b?.end?.endsWith('Z') ? b?.end : b?.end + 'Z').getTime();

  return aStart < bEnd && aEnd > bStart;
}

/**
 * Check if a time point is inside a block interval
 *
 * Time t is inside block B iff: bStart <= t < bEnd
 *
 * @param time Unix timestamp (milliseconds)
 * @param block Block to check
 * @returns true if time is inside the block
 */
export function timeInsideBlock(time: number, block: Block): boolean {
  const blockStart = new Date(block?.start?.endsWith('Z') ? block?.start : block?.start + 'Z').getTime();
  const blockEnd = new Date(block?.end?.endsWith('Z') ? block?.end : block?.end + 'Z').getTime();

  return blockStart <= time && time < blockEnd;
}

/**
 * Find blocks that a time point falls inside
 *
 * @param time Unix timestamp (milliseconds)
 * @param blocks Array of blocks to check
 * @returns Blocks containing the time point
 */
export function findBlocksContainingTime(time: number, blocks: Block[]): Block[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.filter((block) => timeInsideBlock(time, block));
}

/**
 * Clamp a drag selection to avoid overlaps with existing blocks
 *
 * This implements collision-aware clamping:
 * - Forward drag: stops at the start of the next block
 * - Backward drag: stops at the end of the previous block
 * - Adjacency allowed: can touch block boundaries
 *
 * @param anchorTime Starting time of drag (Unix timestamp)
 * @param cursorTime Current cursor time (Unix timestamp)
 * @param blocks Existing blocks on this court/day (should be sorted by start)
 * @returns Clamped interval { start, end } and collision info
 */
export function clampDragToCollisions(
  anchorTime: number,
  cursorTime: number,
  blocks: Block[],
): {
  start: number;
  end: number;
  clamped: boolean;
  clampedBy?: Block;
  direction: 'forward' | 'backward';
} {
  // Determine drag direction
  const direction = cursorTime >= anchorTime ? 'forward' : 'backward';

  // Normalize to [rawStart, rawEnd)
  const rawStart = Math.min(anchorTime, cursorTime);
  const rawEnd = Math.max(anchorTime, cursorTime);

  let clampedStart: number;
  let clampedEnd: number;
  let clamped = false;
  let clampedBy: Block | undefined;

  if (direction === 'forward') {
    // Forward drag: anchor <= cursor
    // Find first block that starts after anchor and before/at cursor
    let minClampEnd = rawEnd;

    for (const block of blocks) {
      const blockStart = new Date(block.start.endsWith('Z') ? block.start : block.start + 'Z').getTime();
      const blockEnd = new Date(block.end.endsWith('Z') ? block.end : block.end + 'Z').getTime();

      // Check if this block creates a boundary we need to stop at
      if (blockStart > anchorTime && blockStart < rawEnd && blockStart < minClampEnd) {
        minClampEnd = blockStart;
        clamped = true;
        clampedBy = block;
      }

      // Also check if we're trying to overlap with this block
      if (blockStart < rawEnd && blockEnd > anchorTime && blockStart < minClampEnd && blockStart > anchorTime) {
        // Overlap detected - clamp to block start
        minClampEnd = blockStart;
        clamped = true;
        clampedBy = block;
      }
    }

    clampedStart = anchorTime;
    clampedEnd = minClampEnd;
  } else {
    // Backward drag: cursor < anchor
    // Find last block that ends before anchor and after/at cursor
    let maxClampStart = rawStart;

    if (Array.isArray(blocks)) {
      for (const block of blocks) {
        const blockStart = new Date(block.start.endsWith('Z') ? block.start : block.start + 'Z').getTime();
        const blockEnd = new Date(block.end.endsWith('Z') ? block.end : block.end + 'Z').getTime();

        // Check if this block creates a boundary we need to stop at
        if (blockEnd < anchorTime && blockEnd > rawStart && blockEnd > maxClampStart) {
          maxClampStart = blockEnd;
          clamped = true;
          clampedBy = block;
        }

        // Also check if we're trying to overlap with this block
        if (blockStart < anchorTime && blockEnd > rawStart && blockEnd > maxClampStart && blockEnd < anchorTime) {
          // Overlap detected - clamp to block end
          maxClampStart = blockEnd;
          clamped = true;
          clampedBy = block;
        }
      }
    }

    clampedStart = maxClampStart;
    clampedEnd = anchorTime;
  }

  return {
    start: clampedStart,
    end: clampedEnd,
    clamped,
    clampedBy,
    direction,
  };
}

/**
 * Sort blocks by start time (ascending)
 * Mutates the array in place
 *
 * @param blocks Array of blocks to sort
 */
export function sortBlocksByStart(blocks: Block[]): void {
  if (!Array.isArray(blocks)) return;
  blocks.sort((a, b) => {
    const aStart = new Date(a.start.endsWith('Z') ? a.start : a.start + 'Z').getTime();
    const bStart = new Date(b.start.endsWith('Z') ? b.start : b.start + 'Z').getTime();
    return aStart - bStart;
  });
}

// Format Converter Module

import type { FormatStructure, SetFormatStructure, GameFormatStructure } from '@Types/scoring/types';
import { stringify as factoryStringify } from '@Helpers/matchUpFormatCode/stringify';
import { parse as factoryParse } from '@Helpers/matchUpFormatCode/parse';

/**
 * Parse a format code
 *
 * @param code - Format code
 * @returns Parsed format object with metadata
 */
export function parseFormat(code: string) {
  // Try factory format first
  const factoryParsed = factoryParse(code);
  if (factoryParsed) {
    // Add explicit gameFormat to setFormat (Option B2: Explicit Minimal)
    // Regular games get {}, No-AD games get { NoAD: true }
    if (factoryParsed.setFormat && !factoryParsed.setFormat.gameFormat) {
      factoryParsed.setFormat.gameFormat = factoryParsed.setFormat.NoAD ? { NoAD: true } : {};
    }

    // Add gameFormat to finalSetFormat if it's a regular set (not tiebreakSet)
    if (
      factoryParsed.finalSetFormat &&
      !factoryParsed.finalSetFormat.tiebreakSet &&
      !factoryParsed.finalSetFormat.gameFormat
    ) {
      factoryParsed.finalSetFormat.gameFormat = factoryParsed.finalSetFormat.NoAD ? { NoAD: true } : {};
    }

    return {
      format: factoryParsed,
      type: 'factory' as const,
      code,
      isValid: true,
    };
  }

  // Invalid format
  return {
    format: undefined,
    type: 'unknown' as const,
    code,
    isValid: false,
  };
}

/**
 * Stringify a format object to Factory format code
 *
 * @param formatObject - Parsed format object from Factory
 * @returns Factory format code string
 */
export function stringifyFormat(formatObject: any): string | undefined {
  return factoryStringify(formatObject);
}

/**
 * Check if a code is a valid Factory format
 *
 * @param code - Format code to check
 * @returns true if valid Factory format
 */
export function isFactoryFormat(code: string): boolean {
  return factoryParse(code) !== undefined;
}

/**
 * Validate a format code (either type)
 *
 * @param code - Format code to validate
 * @returns true if valid
 */
export function isValidFormat(code: string): boolean {
  return isFactoryFormat(code);
}

/**
 * Extract format properties from parsed Factory format
 * Maps Factory structure to UMO-compatible properties
 *
 * @param parsedFormat - Parsed format from Factory
 * @returns Object with UMO-compatible properties
 */
export function extractFormatProperties(parsedFormat: any) {
  const { bestOf, exactly, setFormat, finalSetFormat } = parsedFormat;

  return {
    // Match level
    bestOf,
    exactly,

    // Set level
    setThreshold: setFormat?.setTo,
    setMinDiff: setFormat?.noTiebreak ? 2 : 0,
    setHasDecider: !!setFormat?.tiebreakFormat || !!setFormat?.tiebreakSet,

    // Tiebreak level
    tiebreakAt: setFormat?.tiebreakAt || setFormat?.setTo,
    tiebreakTo: setFormat?.tiebreakFormat?.tiebreakTo || setFormat?.tiebreakSet?.tiebreakTo,
    tiebreakSet: setFormat?.tiebreakSet,
    noTiebreak: setFormat?.noTiebreak,

    // Scoring options
    noAd: setFormat?.NoAD || false,

    // Timed sets
    timed: setFormat?.timed || false,
    minutes: setFormat?.minutes,
    based: setFormat?.based,

    // Final set differences
    finalSetDiffers: !!finalSetFormat,
    finalSetThreshold: finalSetFormat?.setTo,
    finalSetTiebreakAt: finalSetFormat?.tiebreakAt,
    finalSetTiebreakTo: finalSetFormat?.tiebreakFormat?.tiebreakTo || finalSetFormat?.tiebreakSet?.tiebreakTo,
    finalSetNoTiebreak: finalSetFormat?.noTiebreak,
  };
}

/**
 * Get format description from code
 *
 * @param code - Format code
 * @returns Human-readable description
 */
export function getFormatDescription(code: string): string | undefined {
  // If factory, parse and describe
  const parsed = parseFormat(code);
  if (parsed.isValid && parsed.format) {
    const props = extractFormatProperties(parsed.format);

    let desc = '';
    if (props.bestOf) {
      desc += `Best of ${props.bestOf} sets, `;
    } else if (props.exactly) {
      desc += `Exactly ${props.exactly} sets, `;
    }

    if (props.noAd) {
      desc += 'No-Ad, ';
    } else {
      desc += 'Advantage, ';
    }

    desc += `${props.setThreshold} games for set`;

    if (props.tiebreakTo) {
      desc += `, Tiebreak to ${props.tiebreakTo}`;
    }

    if (props.finalSetDiffers) {
      desc += ', final set ';
      if (props.finalSetNoTiebreak) {
        desc += 'by 2 games';
      } else if (props.finalSetTiebreakTo) {
        desc += `tiebreak to ${props.finalSetTiebreakTo}`;
      }
    }

    return desc;
  }

  return undefined;
}

/**
 * Compare two format codes for equivalence
 *
 * @param code1 - First format code
 * @param code2 - Second format code
 * @returns true if formats are equivalent
 */
export function areFormatsEquivalent(code1: string, code2: string): boolean {
  const parsed1 = parseFormat(code1);
  const parsed2 = parseFormat(code2);

  if (!parsed1.isValid || !parsed2.isValid) {
    return false;
  }

  // Compare the parsed structures
  const stringify1 = stringifyFormat(parsed1.format);
  const stringify2 = stringifyFormat(parsed2.format);

  return stringify1 === stringify2;
}

// ============================================================================
// Scoring Inference Functions
// ============================================================================

/**
 * Check if a parsed format uses aggregate scoring
 *
 * Aggregate is signaled by:
 * parsed.aggregate === true (match-level A: SET7XA, HAL2A)
 */
export function isAggregateFormat(parsed: FormatStructure | undefined | null): boolean {
  if (!parsed) return false;
  return !!parsed.aggregate;
}

/**
 * Determine the set type for a given set index based on the format
 */
export type SetType = 'standard' | 'tiebreakOnly' | 'timed' | 'matchTiebreak';

export function resolveSetType(formatStructure: FormatStructure, setsWon: [number, number]): SetType {
  const bestOf = formatStructure.bestOf || formatStructure.exactly || 3;
  const setsToWin = Math.ceil(bestOf / 2);
  const isDecidingSet = setsWon[0] === setsToWin - 1 && setsWon[1] === setsToWin - 1;

  if (isDecidingSet && formatStructure.finalSetFormat) {
    const ff = formatStructure.finalSetFormat;
    if (ff.tiebreakSet) return 'matchTiebreak';
    if (ff.timed) return 'timed';
    return 'standard';
  }

  const sf = formatStructure.setFormat;
  if (!sf) return 'standard';

  if (sf.tiebreakSet) return 'tiebreakOnly';
  if (sf.timed) return 'timed';
  return 'standard';
}

/**
 * Calculate minimum points to win a game in the current context
 *
 * Returns undefined if not deterministic (timed sets)
 */
export function getPointsToGame(
  formatStructure: FormatStructure,
  context: { isDecidingSet: boolean; inTiebreak: boolean; isFinalSetTiebreak: boolean },
): number | undefined {
  const { isDecidingSet, inTiebreak, isFinalSetTiebreak } = context;
  const sf =
    isDecidingSet && formatStructure.finalSetFormat ? formatStructure.finalSetFormat : formatStructure.setFormat;

  if (sf?.timed) return undefined;

  if (isFinalSetTiebreak) {
    return formatStructure.finalSetFormat?.tiebreakSet?.tiebreakTo || 10;
  }

  if (inTiebreak) {
    return sf?.tiebreakFormat?.tiebreakTo || 7;
  }

  if (sf?.tiebreakSet) {
    return sf.tiebreakSet.tiebreakTo;
  }

  if (formatStructure.gameFormat?.type === 'CONSECUTIVE') {
    return formatStructure.gameFormat.count;
  }

  return 4;
}

/**
 * Calculate minimum points to complete a set from 0-0
 *
 * For standard tennis set to 6: 6 games × 4 points = 24 points
 * For tiebreak-only set to 11: 11 points
 * For timed sets: undefined (clock-based)
 */
export function getMinPointsToSetCompletion(
  setFormat: SetFormatStructure | undefined,
  gameFormat?: GameFormatStructure,
): number | undefined {
  if (!setFormat) return undefined;
  if (setFormat.timed) return undefined;

  if (setFormat.tiebreakSet) {
    return setFormat.tiebreakSet.tiebreakTo;
  }

  const setTo = setFormat.setTo || 6;
  const gamePointsTo = gameFormat?.type === 'CONSECUTIVE' ? gameFormat.count || 3 : 4;

  return setTo * gamePointsTo;
}

/**
 * Calculate minimum total points to complete an entire match from 0-0
 *
 * Returns undefined if any set is timed (no deterministic point count)
 */
export function getMinPointsToMatchCompletion(formatStructure: FormatStructure): number | undefined {
  const setPoints = getMinPointsToSetCompletion(formatStructure.setFormat, formatStructure.gameFormat);
  if (setPoints === undefined) return undefined;

  const setsNeeded = formatStructure.exactly ? formatStructure.exactly : Math.ceil((formatStructure.bestOf || 3) / 2);

  return setPoints * setsNeeded;
}

/**
 * Determine whether a format involves countable points
 * (vs timed segments where points are goals/baskets/etc.)
 */
export function hasCountablePoints(formatStructure: FormatStructure): boolean {
  if (formatStructure.setFormat?.timed) return false;
  if (formatStructure.simplified) return false;
  return true;
}

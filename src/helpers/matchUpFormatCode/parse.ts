import { definedAttributes } from '@Tools/definedAttributes';
import { isConvertableInteger } from '@Tools/math';
import { isString } from '@Tools/objects';

// Constants
import { SET, NOAD, TIMED, setTypes } from '@Constants/matchUpFormatConstants';

type TiebreakFormat = {
  tiebreakTo: number;
  modifier?: string;
  NoAD?: boolean;
  invalid?: boolean;
};

type SetFormat = {
  tiebreakFormat?: TiebreakFormat;
  tiebreakSet?: TiebreakFormat;
  tiebreakAt?: string | number;
  noTiebreak?: boolean;
  modifier?: string;
  minutes?: number;
  timed?: boolean;
  based?: string;
  NoAD?: boolean;
  setTo?: number;
};

type SetFormatResult = SetFormat | undefined | false;

export type ParsedFormat = {
  finalSetFormat?: any;
  simplified?: boolean;
  exactly?: number;
  setFormat?: any;
  bestOf?: number;
};

export function parse(matchUpFormatCode: string): ParsedFormat | undefined {
  if (isString(matchUpFormatCode)) {
    const type = (matchUpFormatCode.startsWith('T') && TIMED) || (matchUpFormatCode.startsWith(SET) && SET) || '';

    if (type === TIMED) {
      const setFormat = parseTimedSet(matchUpFormatCode);
      const parsedFormat = {
        simplified: true,
        setFormat,
        bestOf: 1,
      };
      if (setFormat) return parsedFormat;
    }
    if (type === SET) return setsMatch(matchUpFormatCode);
  }

  return undefined;
}

function setsMatch(formatstring: string): any {
  const parts = formatstring.split('-');

  const setsPart = parts[0].slice(3);
  const hasExactlySuffix = setsPart.endsWith('X');
  const setsCountString = hasExactlySuffix ? setsPart.slice(0, -1) : setsPart;
  const setsCount = getNumber(setsCountString);
  // Special case: SET1 and SET1X are both treated as bestOf: 1
  const bestOf = hasExactlySuffix && setsCount !== 1 ? undefined : setsCount;
  const exactly = hasExactlySuffix && setsCount !== 1 ? setsCount : undefined;
  const setFormat = parts && parseSetFormat(parts[1]);
  const finalSetFormat = parts && parseSetFormat(parts[2]);
  const timed = (setFormat && setFormat.timed) || (finalSetFormat && finalSetFormat.timed);
  const validSetsCount = (bestOf && bestOf < 6) || (timed && exactly);
  const validFinalSet = !parts[2] || finalSetFormat;
  const validSetsFormat = setFormat;

  const result: ParsedFormat = definedAttributes({
    setFormat,
    exactly,
    bestOf,
  });
  if (finalSetFormat) result.finalSetFormat = finalSetFormat;
  if (validSetsCount && validSetsFormat && validFinalSet) return result;
}

function parseSetFormat(formatstring: string): SetFormatResult {
  if (formatstring?.[1] !== ':') return undefined;

  const parts = formatstring.split(':');
  const setType = setTypes[parts[0]];
  const setFormatString = parts[1];

  if (!setType || !setFormatString) return undefined;

  return parseSetFormatString(formatstring, setFormatString);
}

function parseSetFormatString(formatstring: string, setFormatString: string): SetFormatResult {
  if (setFormatString.startsWith('TB')) {
    return parseTiebreakSetFormat(setFormatString);
  }

  if (setFormatString.startsWith('T')) {
    return parseTimedSet(setFormatString);
  }

  return parseStandardSetFormat(formatstring, setFormatString);
}

function parseTiebreakSetFormat(setFormatString: string): SetFormatResult {
  const tiebreakSet = parseTiebreakFormat(setFormatString);
  if (tiebreakSet === false) return false;
  return typeof tiebreakSet === 'object' ? { tiebreakSet } : undefined;
}

function parseStandardSetFormat(formatstring: string, setFormatString: string): SetFormat | false {
  const parts = /^[FS]:(\d+)([A-Za-z]*)/.exec(formatstring);
  const NoAD = (parts && isNoAD(parts[2])) || false;
  const validNoAD = !parts?.[2] || NoAD;
  const setTo = parts ? getNumber(parts[1]) : undefined;

  const tiebreakAtValue = parseTiebreakAt(setFormatString);
  const validTiebreakAt = tiebreakAtValue !== false;
  const tiebreakAt = (validTiebreakAt && tiebreakAtValue) || setTo;

  const tiebreakFormat = parseTiebreakFormat(setFormatString.split('/')[1]);
  const validTiebreak = tiebreakFormat !== false;

  if (!setTo || !validNoAD || !validTiebreak || !validTiebreakAt) return false;

  return buildSetFormatResult(setTo, NoAD, tiebreakFormat, tiebreakAt);
}

function buildSetFormatResult(
  setTo: number,
  NoAD: boolean,
  tiebreakFormat: TiebreakFormat | undefined,
  tiebreakAt: string | number | undefined,
): SetFormat {
  const result: SetFormat = { setTo };
  if (NoAD) result.NoAD = true;

  if (tiebreakFormat) {
    result.tiebreakFormat = tiebreakFormat;
    result.tiebreakAt = tiebreakAt;
  } else {
    result.noTiebreak = true;
  }

  return result;
}

function parseTiebreakAt(setFormatString: string, expectNumber: boolean = true) {
  const tiebreakAtValue = setFormatString?.indexOf('@') > 0 && setFormatString.split('@');
  if (tiebreakAtValue) {
    const tiebreakAt = expectNumber ? getNumber(tiebreakAtValue[1]) : tiebreakAtValue[1];
    return tiebreakAt || false;
  }

  return undefined;
}

function parseTiebreakFormat(formatstring: string): TiebreakFormat | undefined | false {
  if (!formatstring) return undefined;
  if (!formatstring.startsWith('TB')) return false;

  return parseTiebreakDetails(formatstring);
}

function parseTiebreakDetails(formatstring: string): TiebreakFormat | false {
  const modifier = parseTiebreakAt(formatstring, false);
  const parts = /^TB(\d+)([A-Za-z]*)/.exec(formatstring);
  const tiebreakToString = parts?.[1];
  const NoAD = parts && isNoAD(parts[2]);
  const validNoAD = !parts?.[2] || NoAD;
  const tiebreakTo = getNumber(tiebreakToString);

  if (!tiebreakTo || !validNoAD) return false;

  const result: TiebreakFormat = { tiebreakTo };

  // modifiers cannot be numeric
  if (modifier && typeof modifier === 'string' && !isConvertableInteger(modifier)) {
    result.modifier = modifier;
  }

  // NOTE: NoAD in tiebreaks is a NON-STANDARD EXTENSION for recreational use.
  // Official TODS only defines NoAD for game-level scoring (no deuce/advantage).
  // Standard tennis tiebreaks always require win-by-2 (e.g., 10-8, 11-9, 12-10).
  // NoAD in tiebreaks changes winBy from 2 to 1 (first to tiebreakTo wins).
  // This is not recognized by ITF, ATP, WTA, or USTA official formats.
  if (NoAD) result.NoAD = true;

  return result;
}

function parseTimedSet(formatstring: string): SetFormat | undefined {
  const timestring = formatstring.slice(1);

  // Parse T{minutes}[P|G|A][/TB{n}]
  // Examples: T10, T10A, T10P/TB1, T10G/TB1
  const parts = /^(\d+)([PGA])?(?:\/TB(\d+))?(@?[A-Za-z]*)?/.exec(timestring);
  const minutes = getNumber(parts?.[1]);
  if (!minutes) return;

  const setFormat: SetFormat = { timed: true, minutes };

  // Parse scoring method (P, G, or A)
  const scoringMethod = parts?.[2];
  if (scoringMethod === 'A') {
    setFormat.based = 'A';
  } else if (scoringMethod === 'P') {
    setFormat.based = 'P';
  } else if (scoringMethod === 'G') {
    setFormat.based = 'G';
  }
  // If no suffix, leave 'based' undefined (games is default)

  // Parse set-level tiebreak (if present)
  // Note: This is notation only for tournament directors
  const setTiebreakTo = parts?.[3];
  if (setTiebreakTo) {
    const tiebreakToNumber = getNumber(setTiebreakTo);
    if (tiebreakToNumber) {
      setFormat.tiebreakFormat = { tiebreakTo: tiebreakToNumber };
    }
  }

  // Handle legacy modifiers (backward compatibility)
  const legacyModifier = parts?.[4];
  const validModifier = [undefined, 'P', 'G', ''].includes(legacyModifier);
  if (legacyModifier && !validModifier) {
    const modifier = /^(\d+)([PGA])?(?:\/TB\d+)?(@)([A-Za-z]+)$/.exec(timestring)?.[4];
    if (modifier) {
      setFormat.modifier = modifier;
      return setFormat;
    }
    return;
  }

  // Keep 'based' for backward compatibility
  if (legacyModifier) setFormat.based = legacyModifier;

  return setFormat;
}

function isNoAD(formatstring) {
  return formatstring?.includes(NOAD);
}

function getNumber(formatstring: string | undefined) {
  const num = Number(formatstring);
  return Number.isNaN(num) ? 0 : num;
}

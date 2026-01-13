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

function parseSetFormat(formatstring: string): SetFormat | undefined | false {
  if (formatstring?.[1] === ':') {
    const parts = formatstring.split(':');
    const setType = setTypes[parts[0]];
    const setFormatString = parts[1];
    if (setType && setFormatString) {
      const isTiebreakSet = setFormatString.startsWith('TB');
      if (isTiebreakSet) {
        const tiebreakSet = parseTiebreakFormat(setFormatString);
        if (tiebreakSet === false) return false;
        return typeof tiebreakSet === 'object' ? { tiebreakSet } : undefined;
      }
      const timedSet = setFormatString.startsWith('T');
      if (timedSet) return parseTimedSet(setFormatString);

      const parts = formatstring.match(/^[FS]:(\d+)([A-Za-z]*)/);
      const NoAD = (parts && isNoAD(parts[2])) || false;
      const validNoAD = !parts?.[2] || NoAD;
      const setTo = parts ? getNumber(parts[1]) : undefined;
      const tiebreakAtValue = parseTiebreakAt(setFormatString);
      const validTiebreakAt = tiebreakAtValue !== false;
      const tiebreakAt = (validTiebreakAt && tiebreakAtValue) || setTo;
      const tiebreakFormat = parseTiebreakFormat(setFormatString.split('/')[1]);
      const validTiebreak = tiebreakFormat !== false;
      const result: SetFormat = { setTo };
      if (NoAD) result.NoAD = true;
      if (tiebreakFormat) {
        result.tiebreakFormat = tiebreakFormat;
        result.tiebreakAt = tiebreakAt;
      } else {
        result.noTiebreak = true;
      }

      return (setTo && validNoAD && validTiebreak && validTiebreakAt && result) || false;
    }
  }

  return undefined;
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
  if (formatstring) {
    if (formatstring.startsWith('TB')) {
      const modifier = parseTiebreakAt(formatstring, false);
      const parts = formatstring.match(/^TB(\d+)([A-Za-z]*)/);
      const tiebreakToString = parts?.[1];
      const NoAD = parts && isNoAD(parts[2]);
      const validNoAD = !parts?.[2] || NoAD;
      const tiebreakTo = getNumber(tiebreakToString);
      if (tiebreakTo && validNoAD) {
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
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  return undefined;
}

function parseTimedSet(formatstring: string): SetFormat | undefined {
  const timestring = formatstring.slice(1);
  const parts = timestring.match(/^(\d+)(@?[A-Za-z]*)/);
  const minutes = getNumber(parts?.[1]);
  if (!minutes) return;
  const setFormat: SetFormat = { timed: true, minutes };
  const based = parts?.[2];
  const validModifier = [undefined, 'P', 'G'].includes(based);
  if (based && !validModifier) {
    const modifier = timestring.match(/^(\d+)(@)([A-Za-z]+)$/)?.[3];
    if (modifier) {
      setFormat.modifier = modifier;
      return setFormat;
    }
    return;
  }
  if (based) setFormat.based = parts[2];
  return setFormat;
}

function isNoAD(formatstring) {
  return formatstring && formatstring.indexOf(NOAD) >= 0;
}

function getNumber(formatstring) {
  return !isNaN(Number(formatstring)) ? Number(formatstring) : 0;
}

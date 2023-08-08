import { isConvertableInteger } from '../../../utilities/math';

import { SET, NOAD, TIMED, setTypes } from './constants';

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

type ParsedFormat = {
  finalSetFormat?: any;
  simplified?: boolean;
  setFormat?: any;
  bestOf: number;
};

export function parse(matchUpFormatCode: string): ParsedFormat | undefined {
  if (typeof matchUpFormatCode === 'string') {
    const type =
      (matchUpFormatCode.startsWith('T') && TIMED) ||
      (matchUpFormatCode.startsWith(SET) && SET) ||
      '';

    if (type === TIMED) {
      const setFormat = parseTimedSet(matchUpFormatCode);
      const parsedFormat = {
        simplified: true,
        setFormat,
        bestOf: 1,
      };
      if (parsedFormat.setFormat) return parsedFormat;
    }
    if (type === SET) return setsMatch(matchUpFormatCode);
  }

  return undefined;
}

function setsMatch(formatstring: string): any {
  const parts = formatstring.split('-');

  const bestOf = getNumber(parts[0].slice(3));
  const setFormat = parts && parseSetFormat(parts[1]);
  const finalSetFormat = parts && parseSetFormat(parts[2]);
  const validBestOf = bestOf && bestOf < 6;
  const validFinalSet = !parts[2] || finalSetFormat;
  const validSetsFormat = setFormat;

  const result: ParsedFormat = { bestOf, setFormat };
  if (finalSetFormat) result.finalSetFormat = finalSetFormat;
  if (validBestOf && validSetsFormat && validFinalSet) return result;
}

function parseSetFormat(formatstring: string): SetFormat | undefined | false {
  if (formatstring?.[1] === ':') {
    const parts = formatstring.split(':');
    const setType = setTypes[parts[0]];
    const setFormatString = parts[1];
    if (setType && setFormatString) {
      const isTiebreakSet = setFormatString.indexOf('TB') === 0;
      if (isTiebreakSet) {
        const tiebreakSet = parseTiebreakFormat(setFormatString);
        if (tiebreakSet === false) return false;
        return typeof tiebreakSet === 'object' ? { tiebreakSet } : undefined;
      }
      const timedSet = setFormatString.indexOf('T') === 0;
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

      return (
        (setTo && validNoAD && validTiebreak && validTiebreakAt && result) ||
        false
      );
    }
  }

  return undefined;
}

function parseTiebreakAt(
  setFormatString: string,
  expectNumber: boolean = true
) {
  const tiebreakAtValue =
    setFormatString?.indexOf('@') > 0 && setFormatString.split('@');
  if (tiebreakAtValue) {
    const tiebreakAt = expectNumber
      ? getNumber(tiebreakAtValue[1])
      : tiebreakAtValue[1];
    return tiebreakAt || false;
  }

  return undefined;
}

function parseTiebreakFormat(
  formatstring: string
): TiebreakFormat | undefined | false {
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
        if (
          modifier &&
          typeof modifier === 'string' &&
          !isConvertableInteger(modifier)
        ) {
          result.modifier = modifier;
        }
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

import { isConvertableInteger } from '../../../utilities/math';

import { SET, NOAD, TIMED, setTypes } from './constants';

export function parse(matchUpFormatCode) {
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
}

function setsMatch(formatstring) {
  const parts = formatstring.split('-');

  const bestOf = getNumber(parts[0].slice(3));
  const setFormat = parts && parseSetFormat(parts[1]);
  const finalSetFormat = parts && parseSetFormat(parts[2]);
  const validBestOf = bestOf && bestOf < 6;
  const validFinalSet =
    !parts[2] || (finalSetFormat && !finalSetFormat.invalid);
  const validSetsFormat = setFormat && !setFormat.invalid;

  const result = { bestOf, setFormat };
  if (finalSetFormat) result.finalSetFormat = finalSetFormat;
  if (validBestOf && validSetsFormat && validFinalSet) return result;
}

function parseSetFormat(formatstring) {
  if (formatstring?.[1] === ':') {
    const parts = formatstring.split(':');
    const setType = setTypes[parts[0]];
    const setFormatString = parts[1];
    if (setType && setFormatString) {
      const tiebreakSet = setFormatString.indexOf('TB') === 0;
      if (tiebreakSet)
        return { tiebreakSet: parseTiebreakFormat(setFormatString) };
      const timedSet = setFormatString.indexOf('T') === 0;
      if (timedSet) {
        return parseTimedSet(setFormatString);
      }
      const parts = formatstring.match(/^[FS]:(\d+)([A-Za-z]*)/);
      const NoAD = (parts && isNoAD(parts[2])) || false;
      const validNoAD = !parts?.[2] || NoAD;
      const setTo = parts && getNumber(parts[1]);
      const tiebreakAtValue = parseTiebreakAt(setFormatString);
      const validTiebreakAt =
        !tiebreakAtValue || (tiebreakAtValue && !tiebreakAtValue.invalid);
      const tiebreakAt = (validTiebreakAt && tiebreakAtValue) || setTo;
      const tiebreakFormat = parseTiebreakFormat(setFormatString.split('/')[1]);
      const validTiebreak = !tiebreakFormat?.invalid;
      const result = { setTo };
      if (NoAD) result.NoAD = true;
      if (tiebreakFormat) {
        result.tiebreakFormat = tiebreakFormat;
        result.tiebreakAt = tiebreakAt;
      } else {
        result.noTiebreak = true;
      }

      return (
        (setTo && validNoAD && validTiebreak && validTiebreakAt && result) || {
          invalid: true,
        }
      );
    }
  }
}

function parseTiebreakAt(setFormatString, expectNumber = true) {
  const tiebreakAtValue =
    setFormatString?.indexOf('@') > 0 && setFormatString.split('@');
  if (tiebreakAtValue) {
    const tiebreakAt = expectNumber
      ? getNumber(tiebreakAtValue[1])
      : tiebreakAtValue[1];
    return tiebreakAt || { invalid: true };
  }
}

function parseTiebreakFormat(formatstring) {
  if (formatstring) {
    if (formatstring.startsWith('TB')) {
      const modifier = parseTiebreakAt(formatstring, false);
      const parts = formatstring.match(/^TB(\d+)([A-Za-z]*)/);
      const tiebreakToString = parts?.[1];
      const NoAD = parts && isNoAD(parts[2]);
      const validNoAD = !parts?.[2] || NoAD;
      const tiebreakTo = getNumber(tiebreakToString);
      if (tiebreakTo && validNoAD) {
        const result = { tiebreakTo };
        // modifiers cannot be numeric
        if (modifier && !isConvertableInteger(modifier))
          result.modifier = modifier;
        if (NoAD) result.NoAD = true;
        return result;
      } else {
        return { invalid: true };
      }
    } else {
      return { invalid: true };
    }
  }
}

function parseTimedSet(formatstring) {
  const timestring = formatstring.slice(1);
  const parts = timestring.match(/^(\d+)(@?[A-Za-z]*)/);
  const minutes = getNumber(parts?.[1]);
  if (!minutes) return;
  const setFormat = { timed: true, minutes };
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

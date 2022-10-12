import { SET, NOAD, TIMED, setTypes } from './constants';

export function parse(matchUpFormatCode) {
  if (matchUpFormatCode && typeof matchUpFormatCode === 'string') {
    const type =
      matchUpFormatCode.indexOf('T') === 0
        ? 'timed'
        : matchUpFormatCode.indexOf(SET) === 0
        ? SET
        : '';
    if (type === TIMED) {
      const parsedFormat = {
        bestOf: 1,
        setFormat: parseTimedSet(matchUpFormatCode),
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
  if (formatstring && formatstring[1] === ':') {
    const isEven = (i) => i % 2 === 0;
    const parts = formatstring.split(':');
    const setType = setTypes[parts[0]];
    const setFormatString = parts[1];
    if (setType && setFormatString) {
      const tiebreakSet = setFormatString.indexOf('TB') === 0;
      if (tiebreakSet)
        return { tiebreakSet: parseTiebreakFormat(setFormatString) };
      const timedSet = setFormatString.indexOf('T') === 0;
      if (timedSet) {
        const timedSetFormat = parseTimedSet(setFormatString);
        return timedSetFormat;
      }
      const parts = formatstring.match(/^[FS]{1}:(\d+)([A-Za-z]*)/);
      const NoAD = (parts && isNoAD(parts[2])) || false;
      const validNoAD = !parts || !parts[2] || NoAD;
      const setTo = parts && getNumber(parts[1]);
      const tiebreakAtValue = parseTiebreakAt(setFormatString);
      const validTiebreakAt =
        !tiebreakAtValue || (tiebreakAtValue && !tiebreakAtValue.invalid);
      const tiebreakAt = (validTiebreakAt && tiebreakAtValue) || setTo;
      const tiebreakFormat = parseTiebreakFormat(setFormatString.split('/')[1]);
      const validTiebreak = !tiebreakFormat || !tiebreakFormat.invalid;
      const result = { setTo };
      if (NoAD) result.NoAD = true;
      if (tiebreakFormat) {
        result.tiebreakFormat = tiebreakFormat;
        result.tiebreakAt = tiebreakAt;
      } else {
        if (isEven(setTo) && setType === setTypes.S) {
          // result.tiebreakFormat = { tiebreakTo: setTo + 1 };
          // result.tiebreakAt = setTo;
          result.noTiebreak = true;
        } else {
          result.noTiebreak = true;
        }
      }
      return (
        (setTo && validNoAD && validTiebreak && validTiebreakAt && result) || {
          invalid: true,
        }
      );
    }
  }
}

function parseTiebreakAt(setFormatString) {
  const tiebreakAtValue =
    setFormatString &&
    setFormatString.indexOf('@') > 0 &&
    setFormatString.split('@');
  if (tiebreakAtValue) {
    const tiebreakAt = getNumber(tiebreakAtValue[1]);
    return tiebreakAt || { invalid: true };
  }
}

function parseTiebreakFormat(formatstring) {
  if (formatstring) {
    if (formatstring.indexOf('TB') === 0) {
      const parts = formatstring.match(/^TB(\d+)([A-Za-z]*)/);
      const tiebreakToString = parts && parts[1];
      const NoAD = parts && isNoAD(parts[2]);
      const validNoAD = !parts || !parts[2] || NoAD;
      const tiebreakTo = getNumber(tiebreakToString);
      if (tiebreakTo && validNoAD) {
        const result = { tiebreakTo };
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
  const minutes = getNumber(timestring);
  if (minutes) return { timed: true, minutes };
}

function isNoAD(formatstring) {
  return formatstring && formatstring.indexOf(NOAD) >= 0;
}

function getNumber(formatstring) {
  return !isNaN(Number(formatstring)) && Number(formatstring);
}

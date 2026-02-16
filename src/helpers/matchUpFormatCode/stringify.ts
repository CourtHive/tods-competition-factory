import { SET, NOAD, AGGR, CONSECUTIVE } from '@Constants/matchUpFormatConstants';
import { isObject } from '@Tools/objects';

export function stringify(matchUpFormatObject, preserveRedundant?: boolean) {
  if (!isObject(matchUpFormatObject)) return undefined;
  if ((matchUpFormatObject?.bestOf || matchUpFormatObject?.exactly) && matchUpFormatObject?.setFormat) {
    return getSetFormat(matchUpFormatObject, preserveRedundant);
  }
  return undefined;
}

function getNumber(formatstring) {
  return !Number.isNaN(Number(formatstring)) && Number(formatstring);
}

function timedSetFormat(matchUpFormatObject) {
  let value = `T${matchUpFormatObject.minutes}`;

  // Add scoring method suffix (A or P, omit G since it's default)
  // Only add if not already in the value (for backward compatibility)
  if (matchUpFormatObject.based === 'A') {
    value += 'A';
  } else if (matchUpFormatObject.based === 'P') {
    value += 'P';
  }
  // Games-based ('G' or undefined) is default, no suffix needed

  // Add set-level tiebreak if present
  if (matchUpFormatObject.tiebreakFormat?.tiebreakTo) {
    value += `/TB${matchUpFormatObject.tiebreakFormat.tiebreakTo}`;
  }

  // Legacy modifier support (for formats with @)
  if (matchUpFormatObject.modifier) value += `@${matchUpFormatObject.modifier}`;

  return value;
}

function stringifyGameFormat(gameFormat) {
  if (gameFormat?.type === AGGR) return AGGR;
  if (gameFormat?.type === CONSECUTIVE && Number.isInteger(gameFormat.count)) return `${gameFormat.count}C`;
  return undefined;
}

function getSetFormat(matchUpFormatObject, preserveRedundant?: boolean) {
  const bestOfValue = getNumber(matchUpFormatObject.bestOf) || undefined;
  const exactly = getNumber(matchUpFormatObject.exactly) || undefined;
  const setLimit = bestOfValue || exactly;

  if (matchUpFormatObject.setFormat?.timed && matchUpFormatObject.simplified && setLimit === 1) {
    return timedSetFormat(matchUpFormatObject.setFormat);
  }

  const root = matchUpFormatObject.matchRoot || SET;
  // Special case: both bestOf: 1 and exactly: 1 stringify as 'SET1' (no X suffix)
  const exactlySuffix = exactly && exactly !== 1 ? 'X' : '';
  const aggregateSuffix = matchUpFormatObject.aggregate ? 'A' : '';
  const setLimitCode = (setLimit && `${root}${setLimit}${exactlySuffix}${aggregateSuffix}`) || '';
  const setCountValue = stringifySet(matchUpFormatObject.setFormat, preserveRedundant);
  const setCode = (setCountValue && `S:${setCountValue}`) || '';
  const finalSetCountValue = stringifySet(matchUpFormatObject.finalSetFormat, preserveRedundant);

  const finalSetCode =
    (setLimit &&
      setLimit > 1 &&
      finalSetCountValue &&
      setCountValue !== finalSetCountValue && // don't include final set code if equivalent to other sets
      `F:${finalSetCountValue}`) ||
    '';

  const gameCode = matchUpFormatObject.gameFormat ? `G:${stringifyGameFormat(matchUpFormatObject.gameFormat)}` : '';

  const valid = setLimitCode && setCountValue;

  if (valid) {
    return [setLimitCode, setCode, gameCode, finalSetCode].filter(Boolean).join('-');
  }
  return undefined;
}

function stringifySet(setObject, preserveRedundant) {
  if (typeof setObject === 'object' && Object.keys(setObject).length) {
    if (setObject.timed) return timedSetFormat(setObject);
    if (setObject.tiebreakSet) return tiebreakFormat(setObject.tiebreakSet);
    const setToValue = getNumber(setObject.setTo);
    if (setToValue) {
      const NoAD = (setObject.NoAD && NOAD) || '';
      const setTiebreakValue = tiebreakFormat(setObject.tiebreakFormat);
      const setTiebreakCode = (setTiebreakValue && `/${setTiebreakValue}`) || '';
      const tiebreakAtValue = getNumber(setObject.tiebreakAt);
      const tiebreakAtCode =
        (tiebreakAtValue && (tiebreakAtValue !== setToValue || preserveRedundant) && `@${tiebreakAtValue}`) || '';
      if (setTiebreakValue !== false) {
        return `${setToValue}${NoAD}${setTiebreakCode}${tiebreakAtCode}`;
      }
    }
  }
  return undefined;
}

function tiebreakFormat(tieobject) {
  if (tieobject) {
    if (typeof tieobject === 'object' && !tieobject.tiebreakTo) {
      return '';
    } else if (typeof tieobject === 'object' && getNumber(tieobject.tiebreakTo)) {
      let value = `TB${tieobject.tiebreakTo}${tieobject.NoAD ? NOAD : ''}`;
      if (tieobject.modifier) value += `@${tieobject.modifier}`;
      return value;
    } else {
      return false;
    }
  }
  return undefined;
}

import { SET, NOAD } from './constants';

export function stringify(matchUpFormatObject, preserveRedundant) {
  if (typeof matchUpFormatObject !== 'object') return;
  if (matchUpFormatObject.timed && !isNaN(matchUpFormatObject.minutes))
    return timedSetFormat(matchUpFormatObject);
  if (matchUpFormatObject.bestOf && matchUpFormatObject.setFormat)
    return getSetFormat(matchUpFormatObject, preserveRedundant);
}

function getNumber(formatstring) {
  return !isNaN(Number(formatstring)) && Number(formatstring);
}

function timedSetFormat(matchUpFormatObject) {
  let value = `T${matchUpFormatObject.minutes}`;
  if (matchUpFormatObject.based) value += matchUpFormatObject.based;
  if (matchUpFormatObject.modifier) value += `@${matchUpFormatObject.modifier}`;
  return value;
}

function getSetFormat(matchUpFormatObject, preserveRedundant) {
  const bestOfValue = getNumber(matchUpFormatObject.bestOf);
  if (
    matchUpFormatObject.setFormat?.timed &&
    matchUpFormatObject.simplified &&
    bestOfValue === 1
  ) {
    return timedSetFormat(matchUpFormatObject.setFormat);
  }
  const bestOfCode = (bestOfValue && `${SET}${bestOfValue}`) || '';
  const setCountValue = stringifySet(
    matchUpFormatObject.setFormat,
    preserveRedundant
  );
  const setCode = (setCountValue && `S:${setCountValue}`) || '';
  const finalSetCountValue = stringifySet(
    matchUpFormatObject.finalSetFormat,
    preserveRedundant
  );
  const finalSetCode =
    (bestOfValue > 1 &&
      finalSetCountValue &&
      setCountValue !== finalSetCountValue && // don't include final set code if equivalent to other sets
      `F:${finalSetCountValue}`) ||
    '';
  const valid = bestOfCode && setCountValue;

  if (valid) {
    return [bestOfCode, setCode, finalSetCode].filter((f) => f).join('-');
  }
}

function stringifySet(setObject, preserveRedundant) {
  if (typeof setObject === 'object' && Object.keys(setObject).length) {
    if (setObject.timed) return timedSetFormat(setObject);
    if (setObject.tiebreakSet) return tiebreakFormat(setObject.tiebreakSet);
    const setToValue = getNumber(setObject.setTo);
    if (setToValue) {
      const NoAD = (setObject.NoAD && NOAD) || '';
      const setTiebreakValue = tiebreakFormat(setObject.tiebreakFormat);
      const setTiebreakCode =
        (setTiebreakValue &&
          !setTiebreakValue.invalid &&
          `/${setTiebreakValue}`) ||
        '';
      const tiebreakAtValue = getNumber(setObject.tiebreakAt);
      const tiebreakAtCode =
        (tiebreakAtValue &&
          (tiebreakAtValue !== setToValue || preserveRedundant) &&
          `@${tiebreakAtValue}`) ||
        '';
      const valid = !setTiebreakValue?.invalid;
      if (valid) {
        return `${setToValue}${NoAD}${setTiebreakCode}${tiebreakAtCode}`;
      }
    }
  }
}

function tiebreakFormat(tieobject) {
  if (tieobject) {
    if (typeof tieobject === 'object' && !tieobject.tiebreakTo) {
      return '';
    } else if (
      typeof tieobject === 'object' &&
      getNumber(tieobject.tiebreakTo)
    ) {
      let value = `TB${tieobject.tiebreakTo}${tieobject.NoAD ? NOAD : ''}`;
      if (tieobject.modifier) value += `@${tieobject.modifier}`;
      return value;
    } else {
      return { invalid: true };
    }
  }
}

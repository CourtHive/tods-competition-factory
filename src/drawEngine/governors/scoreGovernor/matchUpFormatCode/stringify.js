import { SET, NOAD } from './constants';

export function stringify(matchUpFormatObject) {
  if (matchUpFormatObject && typeof matchUpFormatObject === 'object') {
    if (matchUpFormatObject.timed && !isNaN(matchUpFormatObject.minutes))
      return timedSetFormat(matchUpFormatObject);
    if (matchUpFormatObject.bestOf && matchUpFormatObject.setFormat)
      return getSetFormat(matchUpFormatObject);
  }
}

function getNumber(formatstring) {
  return !isNaN(Number(formatstring)) && Number(formatstring);
}

function timedSetFormat(matchUpFormatObject) {
  return `T${matchUpFormatObject.minutes}`;
}

function getSetFormat(matchUpFormatObject) {
  const bestOfValue = getNumber(matchUpFormatObject.bestOf);
  const bestOfCode = (bestOfValue && `${SET}${bestOfValue}`) || '';
  const setCountValue = stringifySet(matchUpFormatObject.setFormat);
  const setCode = (setCountValue && `S:${setCountValue}`) || '';
  const finalSetCountValue = stringifySet(matchUpFormatObject.finalSetFormat);
  const finalSetCode =
    (bestOfValue > 1 &&
      finalSetCountValue &&
      !finalSetCountValue.invalid &&
      setCountValue !== finalSetCountValue && // don't include final set code if equivalent to other sets
      `F:${finalSetCountValue}`) ||
    '';
  const valid =
    bestOfCode &&
    setCountValue &&
    !setCountValue.invalid &&
    (!finalSetCountValue || !finalSetCountValue.invalid);

  if (valid) {
    return [bestOfCode, setCode, finalSetCode].filter((f) => f).join('-');
  }
}

function stringifySet(setObject) {
  if (setObject) {
    if (typeof setObject === 'object') {
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
            tiebreakAtValue !== setToValue &&
            `@${tiebreakAtValue}`) ||
          '';
        const valid = !setTiebreakValue || !setTiebreakValue.invalid;
        if (valid) {
          return `${setToValue}${NoAD}${setTiebreakCode}${tiebreakAtCode}`;
        } else {
          return { invalid: true };
        }
      } else {
        return { invalid: true };
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
      return `TB${tieobject.tiebreakTo}${tieobject.NoAD ? NOAD : ''}`;
    } else {
      return { invalid: true };
    }
  }
}

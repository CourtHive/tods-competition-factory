/**
 *
 * @param start Start of the range
 * @param end End of the range
 */
export const range = (start, end) =>
  Array.from({ length: end + 1 - start }, (v, k) => k + start);

/**
 * Finds possible tiebreak options based on the matchUp configuration
 *
 * @param setTo Current set is played to this number
 */
export const getTiebreakOptions = (setTo) => {
  const tiebreakAtOptions = [setTo];
  if (setTo > 1) {
    tiebreakAtOptions.unshift(setTo - 1);
  }
  return tiebreakAtOptions;
};

/**
 * Creates full tiebreak object with all the properties
 *
 * @param event Select event (checked or unchecked)
 * @param setFormat Could be setFormat or finalSetFormat (same type)
 * @param setTiebreakTo tiebreak in the set is played to this value
 */
export const hasTiebreakObjectBuilder = (event, setFormat, setTiebreakTo) => ({
  setTo: setFormat.setTo,
  noTiebreak: !event.target.checked,
  tiebreakAt: event.target.checked && (setFormat.tiebreakAt || setFormat.setTo),
  [setFormat.tiebreakSet ? 'tiebreakSet' : 'tiebreakFormat']: {
    tiebreakTo: event.target.checked && (setTiebreakTo || 7),
  },
});

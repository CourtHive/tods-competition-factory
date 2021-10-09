export function scoreHasValue({ score } = {}) {
  const { sets, scoreStringSide1, scoreStringSide2 } = score || {};
  return !score
    ? false
    : scoreStringSide1 || scoreStringSide2
    ? true
    : sets?.length
    ? Object.values(sets[0]).some((value) => value)
    : false;
}

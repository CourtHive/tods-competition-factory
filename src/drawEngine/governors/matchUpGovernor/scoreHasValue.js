export function scoreHasValue({ score }) {
  if (!score) return false;
  const { sets, scoreStringSide1, scoreStringSide2 } = score || {};
  if (scoreStringSide1 || scoreStringSide2) return true;
  return sets?.length ? Object.values(sets[0]).some((value) => value) : false;
}

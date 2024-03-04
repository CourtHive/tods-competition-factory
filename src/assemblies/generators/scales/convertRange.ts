// convert one rating range to another rating range
export function convertRange({ value, sourceRange, targetRange }) {
  const minSourceRange = Math.min(...sourceRange);
  const maxSourceRange = Math.max(...sourceRange);
  const minTargetRange = Math.min(...targetRange);
  const maxTargetRange = Math.max(...targetRange);
  return (
    ((value - minSourceRange) * (maxTargetRange - minTargetRange)) / (maxSourceRange - minSourceRange) + minTargetRange
  );
}

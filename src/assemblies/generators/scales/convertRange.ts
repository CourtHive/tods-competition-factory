// convert one rating range to another rating range
export function convertRange({ value, sourceRange, targetRange }) {
  return (
    ((value - sourceRange[0]) * (targetRange[1] - targetRange[0])) / (sourceRange[1] - sourceRange[0]) + targetRange[0]
  );
}

export function powerOf2(n) {
  if (isNaN(n)) return false;
  return n && (n & (n - 1)) === 0;
}

export function nearestPowerOf2(val) {
  return Math.pow(2, Math.round(Math.log(val) / Math.log(2)));
}

export function isNumeric(value) {
  return !isNaN(parseFloat(value));
}

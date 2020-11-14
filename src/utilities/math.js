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

export function isOdd(num) {
  const numInt = parseInt(num);
  if (isNaN(numInt)) return undefined;
  if (numInt === 0) return false;
  return (numInt & -numInt) === 1;
}

export function nextPowerOf2(n) {
  if (isNaN(n)) return false;
  while (!powerOf2(n)) {
    n++;
  }
  return n;
}

export function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

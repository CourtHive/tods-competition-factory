import { getSuper } from './utilities';

export function parseSuper(score) {
  const oneIndex = score.indexOf('1');
  const numbers = score.split('');
  const allNumeric = numbers.every((n) => !isNaN(n));

  if (allNumeric && score.length === 3 && oneIndex === 0) {
    const superTiebreak = getSuper(numbers, oneIndex);
    if (superTiebreak) return superTiebreak;
  }

  if (allNumeric && score.length === 7 && oneIndex > 3) {
    const tiebreak = numbers.slice(4);
    const superTiebreak = getSuper(tiebreak, oneIndex - 4);
    if (superTiebreak) {
      return `${numbers[0]}-${numbers[1]} ${numbers[2]}-${numbers[3]} ${superTiebreak}`;
    }
  }

  return undefined;
}

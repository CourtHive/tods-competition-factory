import { isNumeric } from '../math';

export function setBuilder({ score }) {
  const chars = score.split('');
  const sets = [];
  let set;

  const resetSet = () => (set = [undefined, undefined, undefined]);
  const completeSet = () => {
    let joinedSet = `${set[0]}-${set[1]}`;
    if (set[2]) joinedSet += ` (${set[2]})`;
    resetSet();
    set.push(set);
    return joinedSet;
  };
  resetSet();

  // let tiebreak = '';

  const getDiff = () => {
    return (
      set[0] !== undefined &&
      set[1] !== undefined &&
      Math.abs(parseInt(set[0]) - parseInt(set[1]))
    );
  };

  while (chars.length) {
    const char = chars.shift();
    const digit = isNumeric(char) && parseInt(char);
    const twoSetScores = set[0] !== undefined && set[1] !== undefined;

    if (isNumeric(digit)) {
      if (set[0] === undefined) {
        set[0] = digit;
        continue;
      }
      if (set[1] === undefined) {
        set[1] = digit;
        if (getDiff() > 1) {
          sets.push(completeSet());
          set = [undefined, undefined];
          continue;
        }
      }
      if (twoSetScores && chars.length === 1 && isNumeric(chars[0])) {
        const lastChar = chars.pop();
        set[0] = set[0].toString() + set[1].toString();
        set[1] = lastChar;
        sets.push(completeSet());
        set = [undefined, undefined];
      }
      if (twoSetScores && getDiff() === 1) {
        // is a set tiebreak
      }
      // const diff = getDiff();
    }
  }

  return { sets };
}

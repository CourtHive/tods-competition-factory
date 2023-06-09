import { getSuper, isDiffOne } from './utilities';
import { isNumeric } from '../math';

export function properTiebreak({ score, matchUpStatus }) {
  let parts = score?.split(' ');
  score = parts
    .map((part) => {
      if (part.endsWith(']')) {
        const setScores = part.split('[');
        if (isDiffOne(setScores[0])) {
          return (
            setScores[0] + `(${setScores[1].slice(0, setScores[1].length - 1)})`
          );
        }
      }
      return part;
    })
    .join(' ');

  const tb = new RegExp(/(\([\d ]+\))/g);
  // const tb = new RegExp(/(\([\d+ ]+\))/g);
  if (tb.test(score)) {
    // handle tiebreak score which has no delimiter
    for (const t of score.match(tb)) {
      const replacement = t.replace(' ', '-');
      // score = score.replace(t, replacement);
      let tiebreakScore = replacement.match(/\((.*)\)/)?.[1];
      if (isNumeric(tiebreakScore) && tiebreakScore?.[0] > 2) {
        if ([2, 4].includes(tiebreakScore.length)) {
          tiebreakScore = tiebreakScore.split('').join('-');
        } else if (tiebreakScore.length === 3) {
          const oneIndex = tiebreakScore.indexOf('1');
          tiebreakScore = getSuper(tiebreakScore.split(''), oneIndex);
        }
      }
      score = score.replace(t, `(${tiebreakScore})`);
    }
  }

  parts = score?.split(' ');
  // handles tiebreaks (#-#) or (#/#)
  let re = new RegExp(/^(\d[-/]+\d)\((\d+)[-/]+(\d+)\)$/);
  const lastIndex = parts.length - 1;
  score = parts
    .map((part, index) => {
      const considerCompleted =
        [undefined, '', 'COMPLETED'].includes(matchUpStatus) ||
        index !== lastIndex;
      if (re.test(part) && considerCompleted) {
        const [set, tb1, tb2] = Array.from(part.match(re)).slice(1);
        const lowTiebreakScore = Math.min(tb1, tb2);
        return `${set}(${lowTiebreakScore})`;
      }
      return part;
    })
    .join(' ');

  // convert ##(#) => #-#(#)
  parts = score?.split(' ');
  re = new RegExp(/^(\d{2})\((\d+)\)$/);
  score = parts
    .map((part) => {
      if (re.test(part)) {
        const [set, lowTiebreakScore] = Array.from(part.match(re)).slice(1);
        const setScores = set.split('');
        return `${setScores[0]}-${setScores[1]}(${lowTiebreakScore})`;
      }
      return part;
    })
    .join(' ');

  // convert (#-#)# to #-#(#)
  parts = score?.split(' ');
  re = new RegExp(/^\((\d[-/]+\d)\)(\d+)$/);
  score = parts
    .map((part) => {
      if (re.test(part)) {
        const [set, lowTiebreakScore] = Array.from(part.match(re)).slice(1);
        if (isDiffOne(set)) {
          return `${set}(${lowTiebreakScore})`;
        } else {
          // discard the number outside the bracket as erroneous
          return set;
        }
      }
      return part;
    })
    .join(' ');

  // convert 1-0(#) to super tiebreak
  parts = score?.split(' ');
  re = new RegExp(/^1-0\((\d+)\)$/);
  score = parts
    .map((part) => {
      if (re.test(part)) {
        const [lowTiebreakScore] = part.match(re).slice(1);
        const hightiebreakScore =
          lowTiebreakScore < 9 ? 10 : parseInt(lowTiebreakScore) + 2;
        return `[${hightiebreakScore}-${lowTiebreakScore}]`;
      }
      return part;
    })
    .join(' ');

  // (#0, => (#) // ')' mistyped as '0'
  const misTyped0 = /\((\d)+0 /;
  if (misTyped0.test(score)) {
    const value = score.match(misTyped0)[1];
    score = score.replace(misTyped0, `(${value}) `);
  }

  return { score };
}

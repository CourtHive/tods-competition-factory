import { matchTiebreak, standardSet, tiebreakSet } from './validPatterns';
import { getWinningSide } from './getWinningSide';
import { dashMash } from './commonPatterns';
import { isDiffOne } from './utilities';
import { isNumeric } from '../math';

export function sensibleSets({ score, matchUpStatus, attributes }) {
  const profile = [];

  let maxSetValue;
  const sets = score.split(' ');
  const setsCount = sets.length;

  score = sets
    .map((set, index) => {
      if (new RegExp(tiebreakSet).test(set)) {
        const tiebreak = set.slice(3);
        const setScores = set.slice(0, 3);
        const sideScores = setScores.split('-');

        if (!isDiffOne(setScores) && !matchUpStatus) {
          const maxSetScore = Math.max(...sideScores);
          const maxIndex = setScores.indexOf(maxSetScore);
          const sensibleSetScores = [maxSetScore, maxSetScore - 1];
          const sensibleSetScore = maxIndex
            ? sensibleSetScores.reverse().join('-')
            : sensibleSetScores.join('-');
          return sensibleSetScore + tiebreak;
        }
      } else if (set.length === 2 && isNumeric(set)) {
        return set.split('').join('-');
      }

      set = dashMash(set);

      const setType =
        (new RegExp(`^${matchTiebreak}$`).test(set) && 'super') ||
        (new RegExp(`^${tiebreakSet}$`).test(set) && 'tiebreak') ||
        (new RegExp(`^${standardSet}$`).test(set) && 'standard') ||
        'unknown';
      profile.push(setType);

      // check for reasonable set scores in the first two sets
      if (setsCount > 1 && setType === 'standard' && index < 2) {
        const [s1, s2] = set.split('-');
        const diff = Math.abs(parseInt(s1) - parseInt(s2));
        const max = Math.max(s1, s2);
        const min = Math.min(s1, s2);
        const minIndex = [parseInt(s1), parseInt(s2)].indexOf(min);

        // identify problematic score
        // coerce larger value to something reasonable
        if (max > 9 && diff > 2) {
          const splitMax = max.toString().split('');
          const reasonable =
            splitMax.find(
              (value) =>
                parseInt(value) > min ||
                (index && parseInt(value) <= maxSetValue)
            ) || splitMax[0];

          if (reasonable) {
            set = minIndex
              ? [reasonable, min].join('-')
              : [min, reasonable].join('-');
          }
        }

        if (max > (maxSetValue || 0)) maxSetValue = max;
      }

      // throw out any sets where the values are equal and there is no retirement
      if (setType === 'standard') {
        const [s1, s2] = set.split('-');
        const diff = Math.abs(parseInt(s1) - parseInt(s2));
        if (!diff && matchUpStatus !== 'RETIRED') {
          return '';
        }
      }

      return set;
    })
    .filter(Boolean)
    .join(' ');

  const { setsWon, setWinners, totalSets } = getWinningSide(score);

  // if there was a 6 removed from the end of the score and there is only one set...
  if (totalSets === 1 && attributes?.removed === '6') {
    score += ' 6-0';
  }

  // if a side won the first two sets and there are more than 2 sets, trim the score
  if (
    score.split(' ').length > 2 &&
    Math.max(...setsWon) >= 2 &&
    setWinners[0] === setWinners[1]
  ) {
    score = score.split(' ').slice(0, 2).join(' ');
  }

  if (Math.max(...setsWon) > 2) {
    let counts = [0, 0];
    score = score
      .split(' ')
      .map((set, i) => {
        counts[setWinners[i]] += 1;
        return Math.max(...counts) > 2 ? undefined : set;
      })
      .filter(Boolean)
      .join(' ');
  }

  return { score, profile };
}

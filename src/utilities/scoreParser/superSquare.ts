import { getWinningSide } from './getWinningSide';
import { isNumeric } from '../math';

export function superSquare({ score }) {
  const { setsTied, winningSide } = getWinningSide(score);

  // when final set is (#) match tiebreak
  const finalSetMatchTiebreak = /\s\((\d+)\)$/;
  if (!winningSide && setsTied && finalSetMatchTiebreak.test(score)) {
    const lowTiebreakScore = score.match(finalSetMatchTiebreak).slice(1)[0];
    const highTiebreakScore = lowTiebreakScore <= 8 ? 10 : lowTiebreakScore + 2;
    score = score.replace(
      finalSetMatchTiebreak,
      ` [${highTiebreakScore}-${lowTiebreakScore}]`
    );
  }

  const sets = score.split(' ');
  const finalSet = sets[sets.length - 1];
  if (!finalSet.includes('-') || finalSet.indexOf('(') > 0) return { score };

  let scores = finalSet.split('(').join('').split(')').join('').split('-');
  if (!scores.every((score) => isNumeric(score))) return { score };
  if (scores[0] === '76') {
    const tb =
      scores[1].length === 2
        ? Math.min(...scores[1].split('').map((n) => parseInt(n)))
        : scores[1];
    score = [...sets.slice(0, sets.length - 1), `7-6(${tb})`].join(' ');
  } else {
    scores = scores.map((score) => parseInt(score));

    const maxSetScore = Math.max(...scores);
    let diff = Math.abs(scores[0] - scores[1]);

    if (maxSetScore >= 10) {
      // if both scores are greater than 10 and diff > 2 then attempt to modify
      if (diff > 2 && scores.every((s) => +s >= 10)) {
        const modifiedScores = scores
          .map((s) => (s === maxSetScore ? s - 10 : 10))
          .sort();
        diff = Math.abs(modifiedScores[0] - modifiedScores[1]);
        if (diff > 2) scores = modifiedScores;
      }
      score = [...sets.slice(0, sets.length - 1), `[${scores.join('-')}]`].join(
        ' '
      );
    } else if (sets.length === 3 && maxSetScore >= 7 && diff > 2) {
      score = [...sets.slice(0, sets.length - 1), `[${scores.join('-')}]`].join(
        ' '
      );
    }
  }

  return { score };
}

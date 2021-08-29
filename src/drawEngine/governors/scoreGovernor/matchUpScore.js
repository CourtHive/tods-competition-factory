import { generateScoreString } from './generateScoreString';

export function matchUpScore({ score, winningSide, matchUpStatus } = {}) {
  if (!score) return { sets: [] };

  const sets = score.sets || [];

  let scoreStringSide1 = generateScoreString({
    winnerFirst: false,
    matchUpStatus,
    sets,
  });

  let scoreStringSide2 = generateScoreString({
    winnerFirst: false,
    matchUpStatus,
    reversed: true,
    sets,
  });

  let winnerPerspective = generateScoreString({
    winningSide,
    matchUpStatus,
    sets,
  });

  let loserPerspective =
    scoreStringSide1 === winnerPerspective
      ? scoreStringSide2
      : scoreStringSide1;

  if (winningSide) {
    scoreStringSide1 = winningSide === 1 ? winnerPerspective : loserPerspective;
    scoreStringSide2 = winningSide === 2 ? winnerPerspective : loserPerspective;
  }

  return {
    score: {
      sets,
      scoreStringSide1,
      scoreStringSide2,
    },
  };
}

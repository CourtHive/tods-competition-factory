import { generateScoreString } from '../scoreGovernor/generateScoreString';

export function matchUpScore({ score, winningSide, matchUpStatus } = {}) {
  if (!score) return { sets: [] };

  const sets = score.sets || [];
  let scoreStringSide1;
  let scoreStringSide2;
  const winnerPerspective = generateScoreString({ sets, matchUpStatus });
  const loserPerspective = generateScoreString({
    matchUpStatus,
    reversed: true,
    sets,
  });
  if (winningSide) {
    scoreStringSide1 = winningSide === 1 ? winnerPerspective : loserPerspective;
    scoreStringSide2 = winningSide === 2 ? winnerPerspective : loserPerspective;
  } else {
    scoreStringSide1 = winnerPerspective;
    scoreStringSide2 = loserPerspective;
  }
  return {
    sets,
    scoreStringSide1,
    scoreStringSide2,
  };
}

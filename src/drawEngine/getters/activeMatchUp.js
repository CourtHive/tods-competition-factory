import { isActiveMatchUpStatus } from '../governors/matchUpGovernor/checkStatusType';

// an active matchUp is one that has a winningSide, more than one set, or a single set with any score value greater than zero
// when { matchUpType: TEAM } the child tieMatchUps must be checked as well
// scoreStrings are not reliable because TEAM matchUps can have scoreString '0-0'
export function isActiveMatchUp({
  matchUpStatus,
  winningSide,
  tieMatchUps,
  score,
}) {
  const firstSet = score?.sets?.[0];
  const {
    side1Score,
    side2Score,
    side1TiebreakScore,
    side2TiebreakScore,
    side1PointScore,
    side2PointScore,
  } = firstSet || {};
  const firstSetScore =
    side1Score ||
    side2Score ||
    side1TiebreakScore ||
    side2TiebreakScore ||
    side1PointScore ||
    side2PointScore;
  const scoreExists = score?.sets?.length > 1 || firstSetScore;

  const activeTieMatchUps = tieMatchUps?.filter(isActiveMatchUp)?.length;

  if (scoreExists) console.log({ scoreExists }, score.scoreStringSide1);

  return (
    scoreExists ||
    winningSide ||
    activeTieMatchUps ||
    isActiveMatchUpStatus({ matchUpStatus })
  );
}

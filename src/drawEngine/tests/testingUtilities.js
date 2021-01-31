import tournamentEngine from '../../tournamentEngine';

import { MAIN } from '../../constants/drawDefinitionConstants';

export function getOrderedDrawPositionPairs() {
  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  const orderedPairs = matchUps
    .map(({ roundNumber, roundPosition, drawPositions }) => ({
      roundNumber,
      roundPosition,
      drawPositions,
    }))
    .sort(matchUpSort)
    .map(({ drawPositions }) => drawPositions);
  return { orderedPairs, matchUps };
}

function matchUpSort(a, b) {
  return a.roundNumber - b.roundNumber || a.roundPosition - b.roundPosition;
}

export function getContextMatchUp({
  matchUps,
  roundNumber,
  roundPosition,
  stage = MAIN,
  stageSequence = 1,
}) {
  const matchUp = matchUps.find(
    (matchUp) =>
      matchUp.roundNumber === roundNumber &&
      matchUp.roundPosition === roundPosition &&
      matchUp.stage === stage &&
      matchUp.stageSequence === stageSequence
  );
  return { matchUp };
}

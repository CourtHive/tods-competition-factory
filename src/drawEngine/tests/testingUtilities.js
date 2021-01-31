import tournamentEngine from '../../tournamentEngine';

import { MAIN } from '../../constants/drawDefinitionConstants';
import { REMOVE_ASSIGNMENT } from '../../constants/positionActionConstants';

export function getOrderedDrawPositionPairs({ structureId } = {}) {
  const matchUpFilters = { structureIds: [structureId] };
  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters,
  });
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

export function removeAssignment({
  drawId,
  structureId,
  drawPosition,
  replaceWithBye,
}) {
  let result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  let options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(REMOVE_ASSIGNMENT)).toEqual(true);
  let option = result.validActions.find(
    (action) => action.type === REMOVE_ASSIGNMENT
  );
  const payload = option.payload;
  Object.assign(payload, { replaceWithBye });
  result = tournamentEngine[option.method](payload);
  expect(result.success).toEqual(true);
}

import { matchUpSort } from '../../mocksEngine/utilities/matchUpSort';
import tournamentEngine from '../../tournamentEngine/sync';

import { MAIN } from '../../constants/drawDefinitionConstants';
import { REMOVE_ASSIGNMENT } from '../../constants/positionActionConstants';
import { BYE } from '../../constants/matchUpStatusConstants';
import { ALTERNATE } from '../../constants/entryStatusConstants';

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

export function replaceWithBye({ drawId, structureId, drawPosition }) {
  let { validActions } = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  let { method, payload } = validActions.find(({ type }) => type === BYE);
  let result = tournamentEngine[method](payload);
  expect(result.success).toEqual(true);
  return result;
}

export function replaceWithAlternate({ drawId, structureId, drawPosition }) {
  const { validActions } = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  let result = validActions.find(({ type }) => type === ALTERNATE);
  let { method, payload, availableAlternatesParticipantIds } = result;
  let alternateParticipantId = availableAlternatesParticipantIds[0];
  Object.assign(payload, { alternateParticipantId });
  result = tournamentEngine[method](payload);
  expect(result.success).toEqual(true);
  return result;
}

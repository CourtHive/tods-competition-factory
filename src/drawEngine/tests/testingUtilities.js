import { matchUpSort } from '../getters/matchUpSort';
import tournamentEngine from '../../tournamentEngine/sync';

import { MAIN } from '../../constants/drawDefinitionConstants';
import {
  ASSIGN_PARTICIPANT,
  REMOVE_ASSIGNMENT,
} from '../../constants/positionActionConstants';
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

  const filteredOrderedPairs = orderedPairs.map((pair) =>
    pair.filter((f) => f)
  );
  return { filteredOrderedPairs, orderedPairs, matchUps };
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

export function assignDrawPosition({ drawId, structureId, drawPosition }) {
  let result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  const options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(ASSIGN_PARTICIPANT)).toEqual(true);
  const option = result.validActions.find(
    (action) => action.type === ASSIGN_PARTICIPANT
  );
  const { availableParticipantIds } = option;
  const payload = option.payload;
  const participantId = availableParticipantIds[0];
  Object.assign(payload, { participantId });
  result = tournamentEngine[option.method](payload);
  expect(result.success).toEqual(true);
}

export function removeAssignment({
  drawId,
  structureId,
  drawPosition,
  replaceWithBye,
  policyDefinition,
}) {
  let result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
    policyDefinition,
  });
  expect(result.isDrawPosition).toEqual(true);
  const options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(REMOVE_ASSIGNMENT)).toEqual(true);
  const option = result.validActions.find(
    (action) => action.type === REMOVE_ASSIGNMENT
  );
  const payload = option.payload;
  Object.assign(payload, { replaceWithBye });
  result = tournamentEngine[option.method](payload);
  expect(result.success).toEqual(true);
}

export function replaceWithBye({
  drawId,
  structureId,
  drawPosition,
  policyDefinition,
}) {
  const { validActions } = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
    policyDefinition,
  });
  const { method, payload } = validActions.find(({ type }) => type === BYE);
  const result = tournamentEngine[method](payload);
  expect(result.success).toEqual(true);
  return result;
}

export function replaceWithAlternate({
  drawId,
  structureId,
  drawPosition,
  policyDefinition,
}) {
  const { validActions } = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
    policyDefinition,
  });
  let result = validActions.find(({ type }) => type === ALTERNATE);
  const { method, payload, availableAlternatesParticipantIds } = result;
  const alternateParticipantId = availableAlternatesParticipantIds[0];
  Object.assign(payload, { alternateParticipantId });
  result = tournamentEngine[method](payload);
  expect(result.success).toEqual(true);
  return result;
}

import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../../tournamentEngine';
import {
  getOrderedDrawPositionPairs,
  getContextMatchUp,
} from '../../testingUtilities';

import {
  ALTERNATE_PARTICIPANT,
  REMOVE_ASSIGNMENT,
  SWAP_PARTICIPANTS,
  WITHDRAW_PARTICIPANT,
} from '../../../../constants/positionActionConstants';

it('supports transitive BYE removal', () => {
  swapTest({ swapPosition: 4 });
  swapTest({ swapPosition: 3 });
});

// valid swapPositions for the expectations logic are 3 and 4
function swapTest({ swapPosition }) {
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 6,
    },
  ];
  const { drawIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);
  const drawId = drawIds[0];

  let {
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structures[0].structureId;
  const originalPositionAssignments = structures[0].positionAssignments;

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  let finalMatchUp = matchUps.find(
    ({ roundNumber, roundPosition }) => roundNumber === 2 && roundPosition === 1
  );
  expect(finalMatchUp.drawPositions).toEqual([1, undefined]);
  let { orderedPairs } = getOrderedDrawPositionPairs();
  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, undefined], // drawPosition 1 is BYE-advanced
    [8, undefined], // drawPosition 8 is BYE-advanced
    [undefined, undefined],
  ]);

  removeAssignment({
    drawId,
    structureId,
    drawPosition: 3,
    replaceWithBye: true,
  });
  ({ orderedPairs } = getOrderedDrawPositionPairs());
  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, 4], // drawPositions 1 and 4 are both BYE-advanced
    [8, undefined], // drawPosition 8 is BYE-advanced
    [undefined, undefined],
  ]);
  removeAssignment({
    drawId,
    structureId,
    drawPosition: 4,
    replaceWithBye: true,
  });

  ({ orderedPairs } = getOrderedDrawPositionPairs());
  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, 4],
    [8, undefined],
    [1, undefined], // drawPosition 4 is now a BYE, advancing 1
  ]);

  ({
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId }));
  const modifiedPositionAssignments = structures[0].positionAssignments;
  const originalByeAssignments = originalPositionAssignments
    .filter(({ bye }) => bye)
    .map(({ drawPosition }) => drawPosition);
  const modifiedByeAssignments = modifiedPositionAssignments
    .filter(({ bye }) => bye)
    .map(({ drawPosition }) => drawPosition);

  expect(originalByeAssignments).toEqual([2, 7]);
  expect(modifiedByeAssignments).toEqual([2, 3, 4, 7]);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  let { matchUp } = getContextMatchUp({
    matchUps,
    roundNumber: 2,
    roundPosition: 1,
  });
  expect(matchUp.drawPositions).toEqual([1, 4]);

  tournamentEngine.devContext(true);
  swapPositions({ drawPosition: 5, swapPosition, drawId, structureId });

  ({ orderedPairs } = getOrderedDrawPositionPairs());
  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4], // should be drawPosition 5's previous participantId and a bye
    [5, 6],
    [7, 8],
    [1, swapPosition], // should be drawPosition 5's previousy participantId paired with drawPosition: 1
    [6, 8],
    [undefined, undefined],
  ]);
}

function swapPositions({ drawPosition, swapPosition, drawId, structureId }) {
  let result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);
  let options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(SWAP_PARTICIPANTS)).toEqual(true);
  expect(options.includes(WITHDRAW_PARTICIPANT)).toEqual(true);
  expect(options.includes(ALTERNATE_PARTICIPANT)).toEqual(true);
  expect(options.includes(REMOVE_ASSIGNMENT)).toEqual(true);

  let option = result.validActions.find(
    (action) => action.type === SWAP_PARTICIPANTS
  );
  const availableSwapPositions = option.availableAssignments.map(
    ({ drawPosition }) => drawPosition
  );
  expect(availableSwapPositions.includes(swapPosition));

  const payload = option.payload;
  payload.drawPositions.push(swapPosition);
  result = tournamentEngine[option.method](payload);
  expect(result.success).toEqual(true);
}

/*
function getOrderedDrawPositionPairs() {
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

function getContextMatchUp({
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
*/

function removeAssignment({
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

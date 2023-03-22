import tournamentEngine from '../../../../tournamentEngine/sync';
import mocksEngine from '../../../../mocksEngine';
import { setSubscriptions } from '../../../..';
import { expect, it } from 'vitest';

import { ROUND_ROBIN } from '../../../../constants/drawDefinitionConstants';
import {
  MODIFY_DRAW_DEFINITION,
  MODIFY_POSITION_ASSIGNMENTS,
} from '../../../../constants/topicConstants';
import {
  ALTERNATE_PARTICIPANT,
  REMOVE_ASSIGNMENT,
  SWAP_PARTICIPANTS,
  WITHDRAW_PARTICIPANT,
} from '../../../../constants/positionActionConstants';

it('can recognize valid SWAP positions', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      alternatesCount: 2,
      participantsCount: 30,
    },
  ];
  const { drawIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    inContext: true,
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);
  const drawId = drawIds[0];

  let {
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structures[0].structureId;
  const originalPositionAssignments = structures[0].positionAssignments;

  let drawPosition = 1;
  let result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);
  let options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(SWAP_PARTICIPANTS)).toEqual(true);
  const option = result.validActions.find(
    (action) => action.type === SWAP_PARTICIPANTS
  );
  expect(option.availableAssignments[0].drawPosition).toEqual(2);
  expect(option.availableAssignments.length).toEqual(31);

  const payload = option.payload;
  payload.drawPositions.push(option.availableAssignments[0].drawPosition);
  result = tournamentEngine[option.method](payload);
  expect(result.success).toEqual(true);

  ({
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId }));
  const modifiedPositionAssignments = structures[0].positionAssignments;

  const relevantOriginalAssignments = originalPositionAssignments.filter(
    (assignment) => payload.drawPositions.includes(assignment.drawPosition)
  );
  const relevantModifiedAssignments = modifiedPositionAssignments.filter(
    (assignment) => payload.drawPositions.includes(assignment.drawPosition)
  );

  expect(relevantOriginalAssignments[0].participantId).toEqual(
    relevantModifiedAssignments[1].participantId
  );

  expect(relevantOriginalAssignments[1].participantId).toEqual(
    relevantModifiedAssignments[0].participantId
  );

  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition: 3,
  });
  options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(SWAP_PARTICIPANTS)).toEqual(true);
  // if the seeding policy has ignore valid seed positions then SEED_VALUE will appear for all placed participants
});

it('can SWAP assignment.bye with assignment.participantId with 32 drawSize', () => {
  let assignmentNotifications = [];
  let drawModifications = 0;
  let updatedAt = 0;

  let result = setSubscriptions({
    subscriptions: {
      [MODIFY_DRAW_DEFINITION]: ([{ drawDefinition }]) => {
        drawModifications += 1;
        expect(new Date(drawDefinition.updatedAt).getTime()).toBeGreaterThan(
          new Date(updatedAt).getTime()
        );
        updatedAt = drawDefinition.updatedAt;
      },
      [MODIFY_POSITION_ASSIGNMENTS]: (positions) => {
        assignmentNotifications.push(positions);
      },
    },
  });
  expect(result.success).toEqual(true);

  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
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

  let drawPosition = 1;
  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);
  let options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(SWAP_PARTICIPANTS)).toEqual(true);
  let option = result.validActions.find(
    (action) => action.type === SWAP_PARTICIPANTS
  );
  expect(option.availableAssignments[0].drawPosition).toEqual(2); // this is a bye position
  expect(option.availableAssignments.length).toEqual(31); // because byes are not currently valid

  const payload = option.payload;
  payload.drawPositions.push(option.availableAssignments[0].drawPosition);
  result = tournamentEngine[option.method](payload);
  expect(result.success).toEqual(true);

  ({
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId }));
  const modifiedPositionAssignments = structures[0].positionAssignments;

  const relevantOriginalAssignments = originalPositionAssignments.filter(
    (assignment) => payload.drawPositions.includes(assignment.drawPosition)
  );
  const relevantModifiedAssignments = modifiedPositionAssignments.filter(
    (assignment) => payload.drawPositions.includes(assignment.drawPosition)
  );

  expect(relevantOriginalAssignments[0].participantId).toEqual(
    relevantModifiedAssignments[1].participantId
  );

  expect(relevantOriginalAssignments[1].participantId).toEqual(
    relevantModifiedAssignments[0].participantId
  );

  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(true);
  options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(SWAP_PARTICIPANTS)).toEqual(true);
  expect(options.includes(WITHDRAW_PARTICIPANT)).toEqual(false);
  expect(options.includes(ALTERNATE_PARTICIPANT)).toEqual(true);
  expect(options.includes(REMOVE_ASSIGNMENT)).toEqual(true);

  expect(assignmentNotifications.length).toEqual(2);
  expect(drawModifications).toEqual(2);
});

it('can SWAP assignment.bye with assignment.participantId', () => {
  const drawProfiles = [
    {
      drawSize: 4,
      participantsCount: 3,
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

  let drawPosition = 4;
  let result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);
  let options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(SWAP_PARTICIPANTS)).toEqual(true);
  let option = result.validActions.find(
    (action) => action.type === SWAP_PARTICIPANTS
  );
  expect(option.availableAssignments[1].drawPosition).toEqual(2); // this is a bye position
  expect(option.availableAssignments.length).toEqual(3);

  const payload = option.payload;
  payload.drawPositions.push(option.availableAssignments[1].drawPosition);
  result = tournamentEngine[option.method](payload);
  expect(result.success).toEqual(true);

  ({
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId }));
  const modifiedPositionAssignments = structures[0].positionAssignments;

  const relevantOriginalAssignments = originalPositionAssignments.filter(
    (assignment) => payload.drawPositions.includes(assignment.drawPosition)
  );
  const relevantModifiedAssignments = modifiedPositionAssignments.filter(
    (assignment) => payload.drawPositions.includes(assignment.drawPosition)
  );

  expect(relevantOriginalAssignments[0].participantId).toEqual(
    relevantModifiedAssignments[1].participantId
  );

  expect(relevantOriginalAssignments[1].participantId).toEqual(
    relevantModifiedAssignments[0].participantId
  );

  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(true);
  options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(SWAP_PARTICIPANTS)).toEqual(true);
  expect(options.includes(WITHDRAW_PARTICIPANT)).toEqual(false);
  expect(options.includes(ALTERNATE_PARTICIPANT)).toEqual(true);
  expect(options.includes(REMOVE_ASSIGNMENT)).toEqual(true);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  finalMatchUp = matchUps.find(
    ({ roundNumber, roundPosition }) => roundNumber === 2 && roundPosition === 1
  );
  expect(finalMatchUp.drawPositions).toEqual([3, undefined]);
});

it('can SWAP assigned participantIds', () => {
  const drawProfiles = [
    {
      drawSize: 4,
      alternatesCount: 2,
    },
  ];
  const { drawIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    inContext: true,
    drawProfiles,
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
  if (finalMatchUp.drawPositions) {
    expect(finalMatchUp.drawPositions.filter(Boolean)).toEqual([]);
  }

  let drawPosition = 4;
  let result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);
  let options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(SWAP_PARTICIPANTS)).toEqual(true);
  let option = result.validActions.find(
    (action) => action.type === SWAP_PARTICIPANTS
  );
  expect(option.availableAssignments[1].drawPosition).toEqual(2);
  expect(option.availableAssignments.length).toEqual(3);

  const payload = option.payload;
  payload.drawPositions.push(option.availableAssignments[1].drawPosition);
  result = tournamentEngine[option.method](payload);
  expect(result.success).toEqual(true);

  ({
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId }));
  const modifiedPositionAssignments = structures[0].positionAssignments;

  const relevantOriginalAssignments = originalPositionAssignments.filter(
    (assignment) => payload.drawPositions.includes(assignment.drawPosition)
  );
  const relevantModifiedAssignments = modifiedPositionAssignments.filter(
    (assignment) => payload.drawPositions.includes(assignment.drawPosition)
  );

  expect(relevantOriginalAssignments[0].participantId).toEqual(
    relevantModifiedAssignments[1].participantId
  );

  expect(relevantOriginalAssignments[1].participantId).toEqual(
    relevantModifiedAssignments[0].participantId
  );

  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);
  options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(SWAP_PARTICIPANTS)).toEqual(true);
  expect(options.includes(WITHDRAW_PARTICIPANT)).toEqual(true);
  expect(options.includes(ALTERNATE_PARTICIPANT)).toEqual(true);
  expect(options.includes(REMOVE_ASSIGNMENT)).toEqual(true);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  finalMatchUp = matchUps.find(
    ({ roundNumber, roundPosition }) => roundNumber === 2 && roundPosition === 1
  );
  if (finalMatchUp.drawPositions) {
    expect(finalMatchUp.drawPositions.filter(Boolean)).toEqual([]);
  }
});

it('can SWAP assigned participantIds in a ROUND_ROBIN', () => {
  const drawProfiles = [
    {
      drawSize: 4,
      alternatesCount: 2,
      drawType: ROUND_ROBIN,
    },
  ];
  const { drawIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    inContext: true,
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);
  const drawId = drawIds[0];

  let {
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structures[0].structureId;

  const { positionAssignments: originalPositionAssignments } =
    tournamentEngine.getPositionAssignments({
      drawId: drawIds[0],
      structureId,
    });

  let drawPosition = 4;
  const originalDrawPositionParticipantId = originalPositionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  ).participantId;

  let result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);
  let options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(SWAP_PARTICIPANTS)).toEqual(true);
  let option = result.validActions.find(
    (action) => action.type === SWAP_PARTICIPANTS
  );
  expect(option.availableAssignments[1].drawPosition).toEqual(2);
  expect(option.availableAssignments.length).toEqual(3);

  const payload = option.payload;
  payload.drawPositions.push(option.availableAssignments[1].drawPosition);
  result = tournamentEngine[option.method](payload);
  expect(result.success).toEqual(true);

  ({
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId }));

  const { positionAssignments: modifiedPositionAssignments } =
    tournamentEngine.getPositionAssignments({
      drawId: drawIds[0],
      structureId,
    });

  const modifiedDrawPositionParticipantId = modifiedPositionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  ).participantId;

  expect(originalDrawPositionParticipantId).not.toEqual(
    modifiedDrawPositionParticipantId
  );

  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);
  options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(SWAP_PARTICIPANTS)).toEqual(true);
  expect(options.includes(WITHDRAW_PARTICIPANT)).toEqual(true);
  expect(options.includes(ALTERNATE_PARTICIPANT)).toEqual(true);
  expect(options.includes(REMOVE_ASSIGNMENT)).toEqual(true);
});

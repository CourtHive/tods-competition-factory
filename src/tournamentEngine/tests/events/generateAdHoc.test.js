import { generateRange, randomPop, unique } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { ASSIGN_PARTICIPANT } from '../../../constants/positionActionConstants';
import { AD_HOC, WIN_RATIO } from '../../../constants/drawDefinitionConstants';
import {
  EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
  INVALID_VALUES,
  MISSING_PARTICIPANT_ID,
} from '../../../constants/errorConditionConstants';
import {
  ABANDONED,
  CANCELLED,
  DOUBLE_WALKOVER,
} from '../../../constants/matchUpStatusConstants';
import { arrayIndices } from '../../../utilities/arrays';

it('can generate AD_HOC drawDefinitions, add and delete matchUps', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32, drawType: AD_HOC }],
  });

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.structures.length).toEqual(1);
  expect(drawDefinition.structures[0].finishingPosition).toEqual(WIN_RATIO);

  const structureId = drawDefinition.structures[0].structureId;

  let result = tournamentEngine.generateAdHocMatchUps({ drawId, structureId });
  expect(result.matchUps.length).toEqual(1);

  result = tournamentEngine.generateAdHocMatchUps({
    drawId,
    structureId,
    roundNumber: 2,
    matchUpsCount: 3,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = tournamentEngine.generateAdHocMatchUps({
    drawId,
    structureId,
    roundNumber: 1,
    matchUpsCount: 3,
  });
  expect(result.matchUps.length).toEqual(3);

  result = tournamentEngine.addAdHocMatchUps({
    drawId,
    structureId,
    matchUps: result.matchUps,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.generateAdHocMatchUps({
    drawId,
    structureId,
    roundNumber: 2,
    matchUpsCount: 4,
  });
  expect(result.success).toEqual(true);
  expect(result.matchUps.length).toEqual(4);
  expect(result.matchUps[0].roundNumber).toEqual(2);

  result = tournamentEngine.addAdHocMatchUps({
    drawId,
    structureId,
    matchUps: result.matchUps,
  });
  expect(result.success).toEqual(true);

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  expect(matchUps.length).toEqual(7);

  result = tournamentEngine.generateAdHocMatchUps({
    drawId,
    structureId,
    newRound: true,
    matchUpsCount: 5,
    addMatchUps: true,
  });
  expect(result.success).toEqual(true);
  expect(result.matchUps.length).toEqual(5);
  expect(result.matchUps[0].roundNumber).toEqual(3);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  expect(matchUps.length).toEqual(12);

  const drawPositions = matchUps
    .map(({ drawPositions }) => drawPositions)
    .flat();
  expect(Math.max(...drawPositions)).toEqual(24);

  result = tournamentEngine.getRoundMatchUps({ matchUps });
  expect(result.roundMatchUps[1].length).toEqual(3);
  expect(result.roundMatchUps[2].length).toEqual(4);
  expect(result.roundMatchUps[3].length).toEqual(5);

  let { outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: CANCELLED,
  });
  result = tournamentEngine.setMatchUpStatus({
    matchUpId: matchUps[0].matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({ outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: ABANDONED,
  }));
  result = tournamentEngine.setMatchUpStatus({
    matchUpId: matchUps[1].matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({ outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: DOUBLE_WALKOVER,
  }));
  result = tournamentEngine.setMatchUpStatus({
    matchUpId: matchUps[1].matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  const matchUpIds = matchUps.map(({ matchUpId }) => matchUpId);
  const randomMatchUpIds = generateRange(0, 5).map(() => randomPop(matchUpIds));
  expect(matchUpIds.length).toEqual(7);
  expect(randomMatchUpIds.length).toEqual(5);

  result = tournamentEngine.deleteAdHocMatchUps({
    drawId,
    structureId,
    matchUpIds: randomMatchUpIds,
  });
  expect(result.success).toEqual(true);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  expect(matchUps.length).toEqual(7);
});

it('can generate AD_HOC with arbitrary drawSizes and assign positions', () => {
  const drawSize = 40;
  const matchUpsPerRound = drawSize / 2;

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize, drawType: AD_HOC }],
  });

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const structureId = drawDefinition.structures[0].structureId;

  // generate matchUpsPerRound matchUps and add them to the adHoc draw structure
  let result = tournamentEngine.generateAdHocMatchUps({
    drawId,
    structureId,
    newRound: true,
    matchUpsCount: matchUpsPerRound,
    addMatchUps: true,
  });
  expect(result.success).toEqual(true);
  expect(result.matchUps.length).toEqual(matchUpsPerRound);
  expect(result.matchUps[0].roundNumber).toEqual(1);

  // confirm that drawSize positionAssignments were generated for matchUpsPerRound matchUps
  let { positionAssignments } = tournamentEngine.getPositionAssignments({
    drawId,
    structureId,
  });
  expect(positionAssignments.length).toEqual(drawSize);

  // confirm that matchUpsPerRound matchUps have been generated
  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  expect(matchUps.length).toEqual(matchUpsPerRound);

  // start with the first drawPosition of the first matchUp
  let drawPosition = matchUps[0].drawPositions[0];

  // get the actions for the first drawPosition
  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.hasPositionAssigned).toEqual(false);

  // expect it to be possible to assign a participant to the position
  let assignmentAction = result.validActions.find(
    ({ type }) => type === ASSIGN_PARTICIPANT
  );
  let { method, payload, availableParticipantIds } = assignmentAction;
  expect(payload.drawPosition).toEqual(drawPosition);
  // expect the avialbleParticpantIds to equl the number of entered participants
  // as well as the number of positionAssignments generated for the structure
  expect(availableParticipantIds.length).toEqual(drawSize);

  // expect an error when the participantId is not added to the payload
  result = tournamentEngine[method](payload);
  expect(result.error).toEqual(MISSING_PARTICIPANT_ID);

  // get the first participantId and add to payload
  const firstParticipantId = availableParticipantIds[0];
  payload.participantId = firstParticipantId;
  result = tournamentEngine[method](payload);
  expect(result.success).toEqual(true);

  // check the positionActions for the fist drawPosition
  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  let validActions = result.validActions.map(({ type }) => type);
  // expect that assigning a participant is no longer an option
  expect(validActions.includes(ASSIGN_PARTICIPANT)).toEqual(false);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.hasPositionAssigned).toEqual(true);

  // set the drawPosition to be the second drawPosition in the first matchUp
  drawPosition = matchUps[0].drawPositions[1];
  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  validActions = result.validActions.map(({ type }) => type);
  // expect that assigning a participant is an option
  expect(validActions.includes(ASSIGN_PARTICIPANT)).toEqual(true);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.hasPositionAssigned).toEqual(false);

  assignmentAction = result.validActions.find(
    ({ type }) => type === ASSIGN_PARTICIPANT
  );
  ({ method, payload, availableParticipantIds } = assignmentAction);
  expect(payload.drawPosition).toEqual(drawPosition);

  // expect that the available participantIds does not include the assigned participantId
  expect(availableParticipantIds.length).toEqual(drawSize - 1);
  expect(availableParticipantIds.includes(firstParticipantId)).toEqual(false);

  // set the payload for the second drawPosition assignment to the already assigned firstParticipantId
  payload.participantId = firstParticipantId;
  result = tournamentEngine[method](payload);
  // expect there to be an error since the firstParticipantId is already assigned in the first round
  expect(result.error).toEqual(EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT);

  // assign an availableParticipantId to the payload and expect success
  payload.participantId = availableParticipantIds[0];
  result = tournamentEngine[method](payload);
  expect(result.success).toEqual(true);

  // generate matchUpsPerRound { roundNumber: 2 } matchUps and add them to the adHoc draw structure
  result = tournamentEngine.generateAdHocMatchUps({
    drawId,
    structureId,
    newRound: true,
    matchUpsCount: matchUpsPerRound,
    addMatchUps: true,
  });
  expect(result.success).toEqual(true);
  expect(result.matchUps.length).toEqual(matchUpsPerRound);
  expect(result.matchUps[0].roundNumber).toEqual(2);

  // assign the firstParticipantId to the first matchUp of { roundNumber: 2 }
  drawPosition = result.matchUps[0].drawPositions[1];
  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  validActions = result.validActions.map(({ type }) => type);
  // expect that assigning a participant is an option
  expect(validActions.includes(ASSIGN_PARTICIPANT)).toEqual(true);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.hasPositionAssigned).toEqual(false);

  assignmentAction = result.validActions.find(
    ({ type }) => type === ASSIGN_PARTICIPANT
  );
  ({ method, payload, availableParticipantIds } = assignmentAction);
  expect(payload.drawPosition).toEqual(drawPosition);
  expect(availableParticipantIds.includes(firstParticipantId)).toEqual(true);

  payload.participantId = firstParticipantId;
  result = tournamentEngine[method](payload);
  expect(result.success).toEqual(true);

  ({ positionAssignments } = tournamentEngine.getPositionAssignments({
    drawId,
    structureId,
  }));
  expect(positionAssignments.length).toEqual(drawSize * 2);

  const assignedParticipantIds = positionAssignments
    .filter(({ participantId }) => participantId)
    .map(({ participantId }) => participantId);
  expect(assignedParticipantIds.length).toEqual(3);
  expect(unique(assignedParticipantIds).length).toEqual(2);
  expect(arrayIndices(firstParticipantId, assignedParticipantIds)).toEqual([
    0, 2,
  ]);
});

it('can remove adHoc positionAssignments', () => {
  expect('foo');
});

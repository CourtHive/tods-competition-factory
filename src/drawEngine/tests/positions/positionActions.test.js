import drawEngine from '../..';
import { INVALID_DRAW_POSITION } from '../../../constants/errorConditionConstants';
import {
  ASSIGN_PARTICIPANT,
  REMOVE_PARTICIPANT,
  SWAP_PARTICIPANTS,
} from '../../../constants/positionActionConstants';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../../tournamentEngine';

it('can accurately determine available actions for drawPositions', () => {
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

  const {
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structures[0].structureId;

  let drawPosition = 1;
  let result = drawEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);

  drawPosition = 2;
  result = drawEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(true);

  drawPosition = 0;
  result = drawEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.error).toEqual(INVALID_DRAW_POSITION);

  drawPosition = 40;
  result = drawEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.error).toEqual(INVALID_DRAW_POSITION);
});

it('can remove drawPosition assignment and add it back', () => {
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

  let drawPosition = 1;
  let result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);
  let options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(REMOVE_PARTICIPANT)).toEqual(true);
  let option = result.validActions.find(
    (action) => action.type === REMOVE_PARTICIPANT
  );

  result = tournamentEngine[option.method](option.payload);
  expect(result.success).toEqual(true);

  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  options = result.validActions?.map((validAction) => validAction.type);

  expect(options.includes(ASSIGN_PARTICIPANT)).toEqual(true);
  option = result.validActions.find(
    (action) => action.type === ASSIGN_PARTICIPANT
  );
  expect(option.availableParticipantIds.length).toEqual(1);
  expect(option.participantsAvailable.length).toEqual(1);

  const participantId = option.availableParticipantIds[0];
  const payload = Object.assign({}, option.payload, { participantId });

  result = tournamentEngine[option.method](payload);
  expect(result.success).toEqual(true);
});

it('can recognize valid SWAP positions', () => {
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
  expect(option.availableAssignments[0].drawPosition).toEqual(3);

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
});

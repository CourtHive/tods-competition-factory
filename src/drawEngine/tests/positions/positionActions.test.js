import drawEngine from '../..';
import { INVALID_DRAW_POSITION } from '../../../constants/errorConditionConstants';
import {
  ASSIGN_PARTICIPANT,
  REMOVE_PARTICIPANT,
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
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);
  console.log(result.validActions);

  drawPosition = 2;
  result = drawEngine.positionActions({
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(true);
  console.log(result.validActions);

  drawPosition = 0;
  result = drawEngine.positionActions({
    structureId,
    drawPosition,
  });
  expect(result.error).toEqual(INVALID_DRAW_POSITION);

  drawPosition = 40;
  result = drawEngine.positionActions({
    structureId,
    drawPosition,
  });
  expect(result.error).toEqual(INVALID_DRAW_POSITION);
});

it.only('can remove drawPosition assignment and add it back', () => {
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

  const participantId = option.availableParticipantIds[0];
  const payload = Object.assign({}, option.payload, { participantId });

  result = tournamentEngine[option.method](payload);
  expect(result.success).toEqual(true);
});

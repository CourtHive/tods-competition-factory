import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../../tournamentEngine';

import { ALTERNATE_PARTICIPANT } from '../../../../constants/positionActionConstants';
import { ALTERNATE } from '../../../../constants/entryStatusConstants';

it('can recognize valid ALTERNATES', () => {
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
    drawDefinition: { entries, structures },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structures[0].structureId;
  const alternates = entries.filter((entry) => entry.entryStatus === ALTERNATE);
  expect(alternates.length).toEqual(2);
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
  expect(options.includes(ALTERNATE_PARTICIPANT)).toEqual(true);
  const option = result.validActions.find(
    (action) => action.type === ALTERNATE_PARTICIPANT
  );
  expect(option.availableAlternates.length).toEqual(2);

  const payload = option.payload;
  payload.alternateParticipantId = option.availableAlternatesParticipantIds[0];

  result = tournamentEngine[option.method](payload);
  expect(result.success).toEqual(true);

  ({
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId }));
  const modifiedPositionAssignments = structures[0].positionAssignments;

  expect(originalPositionAssignments[0].participantId).not.toEqual(
    modifiedPositionAssignments[0].participantId
  );

  expect(modifiedPositionAssignments[0].participantId).toEqual(
    payload.alternateParticipantId
  );
});

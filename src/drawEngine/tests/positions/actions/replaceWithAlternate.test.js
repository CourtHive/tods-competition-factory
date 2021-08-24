import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../../tournamentEngine/sync';

import { ALTERNATE_PARTICIPANT } from '../../../../constants/positionActionConstants';
import { ALTERNATE } from '../../../../constants/entryStatusConstants';
import { TO_BE_PLAYED } from '../../../../constants/matchUpStatusConstants';

it('can recognize valid ALTERNATES', () => {
  // Create mock tournament record
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });
  // end mock tournament generation

  tournamentEngine.setState(tournamentRecord);

  let {
    drawDefinition: { entries, structures },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structures[0].structureId;
  const alternates = entries.filter((entry) => entry.entryStatus === ALTERNATE);
  expect(alternates.length).toEqual(2);
  // save original position assignments
  const originalPositionAssignments = structures[0].positionAssignments;

  const { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });

  // get valid actions for drawPosition 1
  let drawPosition = 1;
  let targetMatchUp = matchUps.find(
    (matchUp) =>
      matchUp.roundNumber === 2 && matchUp.drawPositions.includes(drawPosition)
  );
  expect(targetMatchUp.matchUpStatus).toEqual(TO_BE_PLAYED);
  expect(targetMatchUp.drawPositions.includes(drawPosition)).toEqual(true);

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
  // set the alternate participantId which is to be moved into the main draw structure
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

  // ensure that drawPosition is still advanced to the second round
  targetMatchUp = matchUps.find(
    (matchUp) =>
      matchUp.roundNumber === 2 && matchUp.drawPositions.includes(drawPosition)
  );
  expect(targetMatchUp.matchUpStatus).toEqual(TO_BE_PLAYED);
  expect(targetMatchUp.drawPositions.includes(drawPosition)).toEqual(true);
});

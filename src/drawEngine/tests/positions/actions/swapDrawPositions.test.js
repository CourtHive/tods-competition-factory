import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../../tournamentEngine';

import { SWAP_PARTICIPANTS } from '../../../../constants/positionActionConstants';

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
  expect(option.availableAssignments[0].drawPosition).toEqual(3); // because byes are not currently valid
  expect(option.availableAssignments.length).toEqual(29); // because byes are not currently valid

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
  // NOTE: if the seeding policy has ignore valid seed positions then SEED_VALUE will appear for all placed participants
});

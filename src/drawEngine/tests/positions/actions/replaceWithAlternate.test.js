import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../../tournamentEngine';

import { SWAP_PARTICIPANTS } from '../../../../constants/positionActionConstants';

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
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structures[0].structureId;
  // const originalPositionAssignments = structures[0].positionAssignments;

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
});

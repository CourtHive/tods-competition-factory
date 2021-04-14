import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../../tournamentEngine/sync';

import { VOLUNTARY_CONSOLATION } from '../../../constants/drawDefinitionConstants';

it('can voluntary consolation stage', () => {
  const drawSize = 8;
  const drawProfiles = [
    {
      drawSize,
      stage: VOLUNTARY_CONSOLATION,
    },
  ];
  const {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.structures[0].positionAssignments.length).toEqual(
    drawSize
  );
  expect(drawDefinition.structures[0].stage).toEqual(VOLUNTARY_CONSOLATION);
});

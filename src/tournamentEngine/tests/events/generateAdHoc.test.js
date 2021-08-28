import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { AD_HOC, WIN_RATIO } from '../../../constants/drawDefinitionConstants';

it('can generate AD_HOC drawDefinitions', () => {
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
});

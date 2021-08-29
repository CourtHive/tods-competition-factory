import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { AD_HOC } from '../../../constants/drawDefinitionConstants';

it('can generate AD_HOC with arbitrary drawSizes and assign positions', () => {
  const drawSize = 10;

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize, drawType: AD_HOC }],
  });

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const structureId = drawDefinition.structures[0].structureId;

  let result = tournamentEngine.drawMatic({
    restrictEntryStatus: true,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  expect(matchUps.length).toEqual(5);

  result = tournamentEngine.drawMatic({
    restrictEntryStatus: true,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  expect(matchUps.length).toEqual(10);
  expect(matchUps[9].roundNumber).toEqual(2);

  // now get all matchUp.sides => participantIds and ensure all pairings are unique
  // e.g. participants did not play the same opponent
});

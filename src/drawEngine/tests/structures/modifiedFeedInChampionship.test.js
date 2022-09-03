import { tournamentEngine } from '../../../tournamentEngine/sync';
import { mocksEngine } from '../../../mocksEngine';

import { MFIC } from '../../../constants/drawDefinitionConstants';

it('will not feed main final in MFIC with drawSize 4', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawType: MFIC, drawSize: 4 }],
  });

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  console.log(drawDefinition.links);
  console.log(drawDefinition.structures[1].matchUps);
});

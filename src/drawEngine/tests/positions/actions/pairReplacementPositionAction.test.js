import tournamentEngine from '../../../../tournamentEngine/sync';
import mocksEngine from '../../../../mocksEngine';

import { DOUBLES_EVENT } from '../../../../constants/eventConstants';

test('postionAction for replacing participant within PAIR', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 8, eventType: DOUBLES_EVENT }],
  });

  tournamentEngine.setState(tournamentRecord);

  const {
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structures[0].structureId;

  let drawPosition = 1;
  let result = tournamentEngine.positionActions({
    drawPosition,
    structureId,
    drawId,
  });
  expect(result.isActiveDrawPosition).toEqual(false);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);
});

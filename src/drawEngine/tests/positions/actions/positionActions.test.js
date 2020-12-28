import drawEngine from '../../..';
import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../../tournamentEngine';

import { INVALID_DRAW_POSITION } from '../../../../constants/errorConditionConstants';

it('can position details when requesting positionActions', () => {
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
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);

  drawPosition = 2;
  result = drawEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(true);

  drawPosition = 0;
  result = drawEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.error).toEqual(INVALID_DRAW_POSITION);

  drawPosition = 40;
  result = drawEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.error).toEqual(INVALID_DRAW_POSITION);
});

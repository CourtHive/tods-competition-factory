import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../../tournamentEngine';

import { INVALID_DRAW_POSITION } from '../../../../constants/errorConditionConstants';
import { COMPLETED } from '../../../../constants/matchUpStatusConstants';
import {
  PENALTY,
  NICKNAME,
} from '../../../../constants/matchUpActionConstants';

it('can return accurate position details when requesting positionActions', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
      outcomes: [[1, 3, '6-2 6-1', 1]],
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);

  const {
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structures[0].structureId;

  let drawPosition = 1;
  let result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isActiveDrawPosition).toEqual(false);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);

  drawPosition = 2;
  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isActiveDrawPosition).toEqual(false);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(true);

  drawPosition = 0;
  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.error).toEqual(INVALID_DRAW_POSITION);

  drawPosition = 40;
  result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.error).toEqual(INVALID_DRAW_POSITION);
});

it('returns correct positionActions for participants in completed matchUps', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 32,
      outcomes: [[1, 1, '6-2 6-1', 1]],
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

  const { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });

  const drawPosition = 1;
  const targetMatchUp = matchUps.find((matchUp) =>
    matchUp.drawPositions.includes(drawPosition)
  );
  expect(targetMatchUp.matchUpStatus).toEqual(COMPLETED);

  let result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isActiveDrawPosition).toEqual(true);
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);

  const options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(PENALTY)).toEqual(true);
  expect(options.includes(NICKNAME)).toEqual(true);
});

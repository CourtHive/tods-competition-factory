import mocksEngine from '../../../mocksEngine';
import { numericSort } from '../../../utilities';
import tournamentEngine from '../../../tournamentEngine/sync';
import { structureActiveDrawPositions } from '../../getters/structureActiveDrawPositions';

import { BYE, COMPLETED } from '../../../constants/matchUpStatusConstants';

it('correctly identifies active drawPositions', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
      ],
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

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const {
    structures: [{ structureId }],
  } = drawDefinition;

  const { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });

  let drawPosition = 3;
  let targetMatchUp = matchUps.find(
    (matchUp) =>
      matchUp.drawPositions.includes(drawPosition) && matchUp.roundNumber === 1
  );
  expect(targetMatchUp.matchUpStatus).toEqual(COMPLETED);

  const {
    activeDrawPositions,
    byeDrawPositions,
  } = structureActiveDrawPositions({ drawDefinition, structureId });
  expect(activeDrawPositions).toEqual([3, 4]);
  expect(byeDrawPositions).toEqual([2, 31]);

  drawPosition = 1;
  targetMatchUp = matchUps.find(
    (matchUp) =>
      matchUp.drawPositions.includes(drawPosition) && matchUp.roundNumber === 1
  );
  expect(targetMatchUp.matchUpStatus).toEqual(BYE);
});

it('correctly identifies active BYE drawPositions', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 1,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
      ],
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

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const {
    structures: [{ structureId }],
  } = drawDefinition;

  const { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });

  let drawPosition = 3;
  let targetMatchUp = matchUps.find(
    (matchUp) =>
      matchUp.drawPositions.includes(drawPosition) && matchUp.roundNumber === 1
  );
  expect(targetMatchUp.matchUpStatus).toEqual(COMPLETED);

  const {
    activeDrawPositions,
    byeDrawPositions,
  } = structureActiveDrawPositions({ drawDefinition, structureId });
  expect(activeDrawPositions.sort(numericSort)).toEqual([1, 2, 3, 4]);
  expect(byeDrawPositions).toEqual([2, 31]);

  drawPosition = 1;
  targetMatchUp = matchUps.find(
    (matchUp) =>
      matchUp.drawPositions.includes(drawPosition) && matchUp.roundNumber === 1
  );
  expect(targetMatchUp.matchUpStatus).toEqual(BYE);
});

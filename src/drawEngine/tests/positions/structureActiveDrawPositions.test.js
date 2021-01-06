import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../../tournamentEngine';
import { structureActiveDrawPositions } from '../../getters/structureActiveDrawPositions';

import { BYE, COMPLETED } from '../../../constants/matchUpStatusConstants';
import { numericSort } from '../../../utilities';

it('correctly identifies active drawPositions', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
      outcomes: [[1, 2, '6-2 6-1', 1]],
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
    activeByeDrawPositions,
    advancedDrawPositions,
    drawPositionsPairedWithAdvanced,
    byeDrawPositions,
  } = structureActiveDrawPositions({ drawDefinition, structureId });
  expect(advancedDrawPositions).toEqual([1, 3, 32]);
  expect(drawPositionsPairedWithAdvanced).toEqual([2, 4, 31]);
  expect(activeDrawPositions).toEqual([3, 4]);
  expect(activeByeDrawPositions).toEqual([]);
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
        [1, 2, '6-2 6-1', 1],
        [2, 1, '6-2 6-1', 1],
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
    activeByeDrawPositions,
    advancedDrawPositions,
    drawPositionsPairedWithAdvanced,
    byeDrawPositions,
  } = structureActiveDrawPositions({ drawDefinition, structureId });
  expect(advancedDrawPositions).toEqual([1, 3, 32]);
  expect(drawPositionsPairedWithAdvanced).toEqual([2, 4, 31]);
  expect(activeDrawPositions.sort(numericSort)).toEqual([1, 2, 3, 4]);
  expect(activeByeDrawPositions).toEqual([2]);
  expect(byeDrawPositions).toEqual([2, 31]);

  drawPosition = 1;
  targetMatchUp = matchUps.find(
    (matchUp) =>
      matchUp.drawPositions.includes(drawPosition) && matchUp.roundNumber === 1
  );
  expect(targetMatchUp.matchUpStatus).toEqual(BYE);
});

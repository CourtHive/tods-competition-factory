import { getAvailablePlayoffRounds } from '../../governors/structureGovernor/getAvailablePlayoffRounds';
import { reset, initialize, mainDrawPositions } from '../primitives/primitives';
import { drawEngine } from '../..';

import { FIRST_MATCH_LOSER_CONSOLATION } from '../../../constants/drawDefinitionConstants';

it('can correctly determin positions playedOff for STANDARD_ELIMINATION', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const result = drawEngine.devContext(true).generateDrawType();
  expect(result.success).toEqual(true);

  const { drawDefinition } = drawEngine.getState();

  const {
    structure: { structureId },
  } = result;

  const { playoffRounds, playoffRoundsRanges } = getAvailablePlayoffRounds({
    drawDefinition,
    structureId,
  });
  expect(playoffRounds).toEqual([1, 2, 3]);
  expect(playoffRoundsRanges[0]).toEqual({
    roundNumber: 1,
    finishingPositionRange: '9-16',
    finishingPositions: [9, 10, 11, 12, 13, 14, 15, 16],
  });
  expect(playoffRoundsRanges[1]).toEqual({
    roundNumber: 2,
    finishingPositionRange: '5-8',
    finishingPositions: [5, 6, 7, 8],
  });
  expect(playoffRoundsRanges[2]).toEqual({
    roundNumber: 3,
    finishingPositionRange: '3-4',
    finishingPositions: [3, 4],
  });
});

it('can correctly determin positions playedOff for FIRST_MATCH_LOSER_CONSOLATION', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const result = drawEngine.devContext(true).generateDrawType({
    drawType: FIRST_MATCH_LOSER_CONSOLATION,
  });
  expect(result.success).toEqual(true);

  const {
    mainStructure: { structureId },
  } = result;

  const { drawDefinition } = drawEngine.getState();

  const { playoffRounds, playoffRoundsRanges } = getAvailablePlayoffRounds({
    drawDefinition,
    structureId,
  });
  expect(playoffRounds).toEqual([2, 3]);
  expect(playoffRoundsRanges[0]).toEqual({
    roundNumber: 2,
    finishingPositionRange: '5-8',
    finishingPositions: [5, 6, 7, 8],
  });
  expect(playoffRoundsRanges[1]).toEqual({
    roundNumber: 3,
    finishingPositionRange: '3-4',
    finishingPositions: [3, 4],
  });
});

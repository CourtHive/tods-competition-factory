import { getSourceRounds } from '../../governors/structureGovernor/getSourceRounds';
import { reset, initialize, mainDrawPositions } from '../primitives/primitives';
import { drawEngine } from '../..';

import { FEED_FMLC } from '../../../constants/drawDefinitionConstants';

it('can correctly derive source rounds for final positions in SINGLE_ELIMINATION', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const result = drawEngine.devContext(true).generateDrawType();
  expect(result.success).toEqual(true);

  const { drawDefinition } = drawEngine.getState();

  const {
    structure: { structureId },
  } = result;

  let {
    sourceRounds,
    playoffRoundsRanges,
    playoffSourceRounds,
    playedOffSourceRounds,
    playoffPositionsReturned,
  } = getSourceRounds({
    drawDefinition,
    structureId,
    playoffPositions: [1],
  });
  expect(sourceRounds).toEqual([4]);
  expect(playoffSourceRounds).toEqual([]);
  expect(playedOffSourceRounds).toEqual([4]);
  expect(playoffPositionsReturned).toEqual([]);

  ({
    sourceRounds,
    playoffRoundsRanges,
    playoffSourceRounds,
    playoffPositionsReturned,
  } = getSourceRounds({
    drawDefinition,
    structureId,
    playoffPositions: [3, 4],
  }));
  expect(playoffRoundsRanges[0]).toEqual({
    roundNumber: 3,
    finishingPositionRange: '3-4',
    finishingPositions: [3, 4],
  });
  expect(playoffSourceRounds).toEqual([3]);
  expect(playoffPositionsReturned).toEqual([3, 4]);

  ({
    sourceRounds,
    playoffRoundsRanges,
    playoffSourceRounds,
    playoffPositionsReturned,
  } = getSourceRounds({
    drawDefinition,
    structureId,
    playoffPositions: [5, 6],
  }));
  expect(playoffSourceRounds).toEqual([2]);
  expect(playoffPositionsReturned).toEqual([5, 6, 7, 8]);

  ({
    sourceRounds,
    playoffSourceRounds,
    playoffPositionsReturned,
  } = getSourceRounds({
    drawDefinition,
    structureId,
    playoffPositions: [9],
  }));
  expect(playoffSourceRounds).toEqual([1]);
  expect(playoffPositionsReturned).toEqual([9, 10, 11, 12, 13, 14, 15, 16]);
});

it('can correctly derive source rounds for final positions in FEED_FMLC', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const result = drawEngine.devContext(true).generateDrawType({
    drawType: FEED_FMLC,
  });
  expect(result.success).toEqual(true);

  const { drawDefinition } = drawEngine.getState();

  const {
    mainStructure: { structureId: mainStructureId },
    consolationStructure: { structureId: consolationStructureId },
  } = result;

  let { playoffSourceRounds, playoffPositionsReturned } = getSourceRounds({
    drawDefinition,
    structureId: mainStructureId,
    playoffPositions: [3, 4],
  });
  expect(playoffSourceRounds).toEqual([3]);
  expect(playoffPositionsReturned).toEqual([3, 4]);

  ({ playoffSourceRounds, playoffPositionsReturned } = getSourceRounds({
    drawDefinition,
    structureId: consolationStructureId,
    playoffPositions: [15],
  }));
  expect(playoffSourceRounds).toEqual([1]);
  expect(playoffPositionsReturned).toEqual([13, 14, 15, 16]);
});

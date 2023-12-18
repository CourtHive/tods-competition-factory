import { generateDrawTypeAndModifyDrawDefinition } from '../../../assemblies/generators/drawDefinitions/generateDrawTypeAndModifyDrawDefinition';
import { getSourceRounds } from '../../governors/structureGovernor/getSourceRounds';
import { setStageDrawSize } from '../../governors/entryGovernor/stageEntryCounts';
import { newDrawDefinition } from '../../../assemblies/generators/drawDefinitions/newDrawDefinition';
import { it, expect } from 'vitest';

import { FIRST_MATCH_LOSER_CONSOLATION } from '../../../constants/drawDefinitionConstants';
import { DrawDefinition } from '../../../types/tournamentTypes';

it('can correctly derive source rounds for final positions in SINGLE_ELIMINATION', () => {
  const drawDefinition: DrawDefinition = newDrawDefinition();
  setStageDrawSize({ drawDefinition, stage: 'MAIN', drawSize: 16 });
  const result = generateDrawTypeAndModifyDrawDefinition({ drawDefinition });
  expect(result.success).toEqual(true);

  const structureId = result.structures?.[0].structureId ?? '';

  let srResult = getSourceRounds({
    playoffPositions: [1],
    drawDefinition,
    structureId,
  });

  let { playoffSourceRounds, playoffPositionsReturned } = srResult;
  expect(srResult.sourceRounds).toEqual([4]);
  expect(playoffSourceRounds).toEqual([]);
  expect(srResult.playedOffSourceRounds).toEqual([4]);
  expect(playoffPositionsReturned).toEqual([]);

  srResult = getSourceRounds({
    playoffPositions: [3, 4],
    drawDefinition,
    structureId,
  });
  ({ playoffSourceRounds, playoffPositionsReturned } = srResult);

  expect(srResult.playoffRoundsRanges[0]).toEqual({
    roundNumber: 3,
    finishingPositionRange: '3-4',
    finishingPositions: [3, 4],
  });
  expect(playoffSourceRounds).toEqual([3]);
  expect(playoffPositionsReturned).toEqual([3, 4]);

  ({ playoffSourceRounds, playoffPositionsReturned } = getSourceRounds({
    drawDefinition,
    structureId,
    playoffPositions: [5, 6],
  }));
  expect(playoffSourceRounds).toEqual([2]);
  expect(playoffPositionsReturned).toEqual([5, 6, 7, 8]);

  ({ playoffSourceRounds, playoffPositionsReturned } = getSourceRounds({
    drawDefinition,
    structureId,
    playoffPositions: [9],
  }));
  expect(playoffSourceRounds).toEqual([1]);
  expect(playoffPositionsReturned).toEqual([9, 10, 11, 12, 13, 14, 15, 16]);
});

it('can correctly derive source rounds for final positions in FIRST_MATCH_LOSER_CONSOLATION', () => {
  const drawDefinition: DrawDefinition = newDrawDefinition();
  setStageDrawSize({ drawDefinition, stage: 'MAIN', drawSize: 16 });
  const result = generateDrawTypeAndModifyDrawDefinition({
    drawDefinition,
    drawType: FIRST_MATCH_LOSER_CONSOLATION,
  });
  expect(result.success).toEqual(true);

  const structures = result?.structures ?? [];
  const [
    { structureId: mainStructureId },
    { structureId: consolationStructureId },
  ] = structures;

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

  // TODO: This should perhaps be [1, 2] since with FMLC both rounds can produce 13-16
  expect(playoffSourceRounds).toEqual([2]);
  expect(playoffPositionsReturned).toEqual([13, 14, 15, 16]);
});

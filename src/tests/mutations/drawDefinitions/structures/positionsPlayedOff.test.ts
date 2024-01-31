import { generateDrawTypeAndModifyDrawDefinition } from '@Assemblies/generators/drawDefinitions/generateDrawTypeAndModifyDrawDefinition';
import { getPositionsPlayedOff } from '@Query/drawDefinition/getPositionsPlayedOff';
import { setStageDrawSize } from '@Mutate/drawDefinitions/entryGovernor/stageEntryCounts';
import { newDrawDefinition } from '@Assemblies/generators/drawDefinitions/newDrawDefinition';
import { expect, it } from 'vitest';

import { FIRST_MATCH_LOSER_CONSOLATION } from '../../../../constants/drawDefinitionConstants';
import { DrawDefinition } from '@Types/tournamentTypes';

it('can correctly determin positions playedOff for STANDARD_ELIMINATION', () => {
  const drawDefinition: DrawDefinition = newDrawDefinition();
  setStageDrawSize({ drawDefinition, stage: 'MAIN', drawSize: 16 });
  const result = generateDrawTypeAndModifyDrawDefinition({ drawDefinition });
  expect(result.success).toEqual(true);

  const structureIds = drawDefinition.structures?.map((s) => s.structureId);

  const { positionsPlayedOff } = getPositionsPlayedOff({
    drawDefinition,
    structureIds,
  });
  expect(positionsPlayedOff).toEqual([1, 2]);
});

it('can correctly determin positions playedOff for FIRST_MATCH_LOSER_CONSOLATION', () => {
  const drawDefinition: DrawDefinition = newDrawDefinition();
  setStageDrawSize({ drawDefinition, stage: 'MAIN', drawSize: 16 });
  const result = generateDrawTypeAndModifyDrawDefinition({
    drawType: FIRST_MATCH_LOSER_CONSOLATION,
    drawDefinition,
  });
  expect(result.success).toEqual(true);
  const structureIds = result.drawDefinition?.structures?.map((s) => s.structureId);

  const { positionsPlayedOff } = getPositionsPlayedOff({
    drawDefinition,
    structureIds,
  });
  expect(positionsPlayedOff).toEqual([1, 2, 9, 10]);
});

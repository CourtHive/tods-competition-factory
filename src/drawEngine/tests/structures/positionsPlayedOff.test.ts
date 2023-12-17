import { generateDrawTypeAndModifyDrawDefinition } from '../../governors/structureGovernor/generateDrawTypeAndModifyDrawDefinition';
import { getPositionsPlayedOff } from '../../governors/structureGovernor/getPositionsPlayedOff';
import { setStageDrawSize } from '../../governors/entryGovernor/stageEntryCounts';
import { newDrawDefinition } from '../../stateMethods';
import { expect, it } from 'vitest';

import { FIRST_MATCH_LOSER_CONSOLATION } from '../../../constants/drawDefinitionConstants';
import { DrawDefinition } from '../../../types/tournamentTypes';

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
  const structureIds = result.drawDefinition?.structures?.map(
    (s) => s.structureId
  );

  const { positionsPlayedOff } = getPositionsPlayedOff({
    drawDefinition,
    structureIds,
  });
  expect(positionsPlayedOff).toEqual([1, 2, 9, 10]);
});

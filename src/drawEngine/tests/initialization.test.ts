import { it, expect } from 'vitest';

import { ERROR, SUCCESS } from '../../constants/resultConstants';
import {
  MAIN,
  QUALIFYING,
  CONSOLATION,
} from '../../constants/drawDefinitionConstants';
import { newDrawDefinition } from '../../assemblies/generators/drawDefinitions/newDrawDefinition';
import {
  setStageAlternatesCount,
  setStageDrawSize,
  setStageQualifiersCount,
  setStageWildcardsCount,
} from '../governors/entryGovernor/stageEntryCounts';
import { DrawDefinition } from '../../types/tournamentTypes';

let result;

it('can configure drawSize for all stages', () => {
  const drawDefinition: DrawDefinition = newDrawDefinition();
  result = setStageDrawSize({ drawDefinition, stage: QUALIFYING, drawSize: 8 });
  expect(result).toMatchObject(SUCCESS);
  result = setStageDrawSize({ drawDefinition, stage: MAIN, drawSize: 8 });
  expect(result).toMatchObject(SUCCESS);
  result = setStageDrawSize({
    drawDefinition,
    stage: CONSOLATION,
    drawSize: 8,
  });
  expect(result).toMatchObject(SUCCESS);
  result = setStageDrawSize({ drawDefinition, stage: 'INVALID', drawSize: 8 });
  expect(result).toHaveProperty(ERROR);

  result = setStageAlternatesCount({
    alternatesCount: 8,
    stage: QUALIFYING,
    drawDefinition,
  });
  expect(result).toMatchObject(SUCCESS);
  result = setStageAlternatesCount({
    alternatesCount: 8,
    drawDefinition,
    stage: MAIN,
  });
  expect(result).toMatchObject(SUCCESS);
  result = setStageAlternatesCount({
    stage: CONSOLATION,
    alternatesCount: 8,
    drawDefinition,
  });
  expect(result).toMatchObject(SUCCESS);
  result = setStageAlternatesCount({
    alternatesCount: 8,
    stage: 'INVALID',
    drawDefinition,
  });
  expect(result).toHaveProperty(ERROR);

  result = setStageWildcardsCount({
    stage: QUALIFYING,
    wildcardsCount: 8,
    drawDefinition,
  });
  expect(result).toMatchObject(SUCCESS);
  result = setStageWildcardsCount({
    wildcardsCount: 8,
    drawDefinition,
    stage: MAIN,
  });
  expect(result).toMatchObject(SUCCESS);
  result = setStageWildcardsCount({
    stage: CONSOLATION,
    wildcardsCount: 8,
    drawDefinition,
  });
  expect(result).toMatchObject(SUCCESS);
  result = setStageWildcardsCount({
    stage: 'INVALID',
    wildcardsCount: 8,
    drawDefinition,
  });
  expect(result).toHaveProperty(ERROR);

  result = setStageQualifiersCount({
    stage: QUALIFYING,
    qualifiersCount: 8,
    drawDefinition,
  });
  expect(result).toHaveProperty(ERROR);
  result = setStageQualifiersCount({
    qualifiersCount: 8,
    drawDefinition,
    stage: MAIN,
  });
  expect(result).toMatchObject(SUCCESS);
  result = setStageQualifiersCount({
    stage: CONSOLATION,
    qualifiersCount: 8,
    drawDefinition,
  });
  expect(result).toHaveProperty(ERROR);
  result = setStageQualifiersCount({
    qualifiersCount: 8,
    stage: 'INVALID',
    drawDefinition,
  });
  expect(result).toHaveProperty(ERROR);
});

it('can initialize, setState, and query', () => {
  const drawDefinition = newDrawDefinition({ drawId: 'uuid-xyz' });
  const { drawId } = drawDefinition;
  expect(drawId).toEqual('uuid-xyz');
});

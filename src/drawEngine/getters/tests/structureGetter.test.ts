import { generateDrawTypeAndModifyDrawDefinition } from '../../governors/structureGovernor/generateDrawTypeAndModifyDrawDefinition';
import { setStageDrawSize } from '../../governors/entryGovernor/stageEntryCounts';
import { feedInChampionship } from '../../tests/primitives/feedIn';
import { findStructure, getDrawStructures } from '../findStructure';
import { constantToString } from '../../../utilities/strings';
import { newDrawDefinition } from '../../../assemblies/generators/drawDefinitions/newDrawDefinition';
import { expect, it } from 'vitest';

import { ERROR } from '../../../constants/resultConstants';
import { DrawDefinition } from '../../../types/tournamentTypes';
import {
  COMPASS,
  FEED_IN_CHAMPIONSHIP,
  MAIN,
  CONSOLATION,
} from '../../../constants/drawDefinitionConstants';

it('can find structures by structureId', () => {
  const drawDefinition: DrawDefinition = newDrawDefinition();
  setStageDrawSize({ drawDefinition, stage: MAIN, drawSize: 32 });
  generateDrawTypeAndModifyDrawDefinition({
    drawDefinition,
    drawType: COMPASS,
  });
  const { structures } = getDrawStructures({ drawDefinition, stage: MAIN });
  const structureIdMap = Object.assign(
    {},
    ...(structures || []).map((structure) => ({
      [structure.structureId]: structure.structureName,
    }))
  );
  Object.keys(structureIdMap).forEach((structureId) => {
    const { structure } = findStructure({ drawDefinition, structureId });
    expect(structure?.structureName).toEqual(structureIdMap[structureId]);
  });
});

it('can find structures by stage and stageSequence', () => {
  const drawDefinition: DrawDefinition = newDrawDefinition();
  setStageDrawSize({ drawDefinition, stage: MAIN, drawSize: 32 });
  generateDrawTypeAndModifyDrawDefinition({
    drawDefinition,
    drawType: COMPASS,
  });

  const { structures: stage2Structures } = getDrawStructures({
    drawDefinition,
    stage: MAIN,
    stageSequence: 2,
  });
  expect(stage2Structures?.length).toEqual(3);
  expect(
    stage2Structures?.map((structure) => structure.structureName)
  ).toMatchObject(['West', 'North', 'Northeast']);

  const { structures: stage3Structures } = getDrawStructures({
    drawDefinition,
    stage: MAIN,
    stageSequence: 3,
  });
  expect(stage3Structures?.length).toEqual(3);
  expect(
    stage3Structures?.map((structure) => structure.structureName)
  ).toMatchObject(['South', 'Northwest', 'Southwest']);

  const { structures: stage4Structures } = getDrawStructures({
    drawDefinition,
    stage: MAIN,
    stageSequence: 4,
  });
  expect(
    stage4Structures?.map((structure) => structure.structureName)
  ).toMatchObject(['Southeast']);

  const { structures: consolationStructures } = getDrawStructures({
    drawDefinition,
    stage: CONSOLATION,
    stageSequence: 1,
  });
  expect(consolationStructures?.length).toEqual(0);
});

it('can find structures by stage', () => {
  const { drawDefinition } = feedInChampionship({
    drawSize: 16,
    drawType: FEED_IN_CHAMPIONSHIP,
  });
  const {
    structures: [structure],
  } = getDrawStructures({ drawDefinition, stage: MAIN });
  expect(structure.structureName).toEqual(constantToString(MAIN));
  const {
    structures: [consolation],
  } = getDrawStructures({ drawDefinition, stage: CONSOLATION });
  expect(consolation.structureName).toEqual(constantToString(CONSOLATION));

  const result = getDrawStructures({ stage: CONSOLATION });
  expect(result).toHaveProperty(ERROR);
});

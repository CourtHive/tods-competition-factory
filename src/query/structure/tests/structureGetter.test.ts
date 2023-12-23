import { generateDrawTypeAndModifyDrawDefinition } from '../../../assemblies/generators/drawDefinitions/generateDrawTypeAndModifyDrawDefinition';
import { newDrawDefinition } from '../../../assemblies/generators/drawDefinitions/newDrawDefinition';
import { setStageDrawSize } from '../../../drawEngine/governors/entryGovernor/stageEntryCounts';
import { feedInChampionship } from '../../../drawEngine/tests/primitives/feedIn';
import { constantToString } from '../../../utilities/strings';
import { expect, it } from 'vitest';
import {
  findStructure,
  getDrawStructures,
} from '../../../acquire/findStructure';

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
    drawType: COMPASS,
    drawDefinition,
  });

  const { structures: stage2Structures } = getDrawStructures({
    stageSequence: 2,
    drawDefinition,
    stage: MAIN,
  });
  expect(stage2Structures?.length).toEqual(3);
  expect(
    stage2Structures?.map((structure) => structure.structureName)
  ).toMatchObject(['West', 'North', 'Northeast']);

  const { structures: stage3Structures } = getDrawStructures({
    stageSequence: 3,
    drawDefinition,
    stage: MAIN,
  });
  expect(stage3Structures?.length).toEqual(3);
  expect(
    stage3Structures?.map((structure) => structure.structureName)
  ).toMatchObject(['South', 'Northwest', 'Southwest']);

  const { structures: stage4Structures } = getDrawStructures({
    stageSequence: 4,
    drawDefinition,
    stage: MAIN,
  });
  expect(
    stage4Structures?.map((structure) => structure.structureName)
  ).toMatchObject(['Southeast']);

  const { structures: consolationStructures } = getDrawStructures({
    stage: CONSOLATION,
    stageSequence: 1,
    drawDefinition,
  });
  expect(consolationStructures?.length).toEqual(0);
});

it('can find structures by stage', () => {
  const { drawDefinition } = feedInChampionship({
    drawType: FEED_IN_CHAMPIONSHIP,
    drawSize: 16,
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

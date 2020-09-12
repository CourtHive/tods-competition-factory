import { drawEngine } from '../../drawEngine';
import { feedInChampionship } from '../../drawEngine/tests/primitives/feedIn';
import {
  findStructure,
  drawStructures,
} from '../../drawEngine/getters/findStructure';
import {
  reset,
  initialize,
  mainDrawPositions,
} from '../../drawEngine/tests/primitives/primitives';
import {
  COMPASS,
  FEED_IN_CHAMPIONSHIP,
  MAIN,
  CONSOLATION,
} from '../../constants/drawDefinitionConstants';
import { ERROR } from '../../constants/resultConstants';

it('can find structures by structureId', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 32 });
  drawEngine.generateDrawType({ drawType: COMPASS });
  const { drawDefinition } = drawEngine.getState();
  const { structures } = drawStructures({ drawDefinition, stage: MAIN });
  const structureIdMap = Object.assign(
    {},
    ...structures.map(structure => ({
      [structure.structureId]: structure.structureName,
    }))
  );
  Object.keys(structureIdMap).forEach(structureId => {
    const { structure } = findStructure({ drawDefinition, structureId });
    expect(structure.structureName).toEqual(structureIdMap[structureId]);
  });
});

it('can find structures by stage and stageSequence', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 32 });
  drawEngine.generateDrawType({ drawType: COMPASS });
  const { drawDefinition } = drawEngine.getState();

  const { structures: stage2Structures } = drawStructures({
    drawDefinition,
    stage: MAIN,
    stageSequence: 2,
  });
  expect(stage2Structures.length).toEqual(3);
  expect(
    stage2Structures.map(structure => structure.structureName)
  ).toMatchObject(['WEST', 'NORTH', 'NORTHEAST']);

  const { structures: stage3Structures } = drawStructures({
    drawDefinition,
    stage: MAIN,
    stageSequence: 3,
  });
  expect(stage3Structures.length).toEqual(3);
  expect(
    stage3Structures.map(structure => structure.structureName)
  ).toMatchObject(['SOUTH', 'SOUTHWEST', 'NORTHWEST']);

  const { structures: stage4Structures } = drawStructures({
    drawDefinition,
    stage: MAIN,
    stageSequence: 4,
  });
  expect(
    stage4Structures.map(structure => structure.structureName)
  ).toMatchObject(['SOUTHEAST']);

  const { structures: consolationStructures } = drawStructures({
    drawDefinition,
    stage: CONSOLATION,
    stageSequence: 1,
  });
  expect(consolationStructures.length).toEqual(0);
});

it('can find structures by stage', () => {
  feedInChampionship({ drawSize: 16, drawType: FEED_IN_CHAMPIONSHIP });
  const { drawDefinition } = drawEngine.getState();
  const {
    structures: [structure],
  } = drawStructures({ drawDefinition, stage: MAIN });
  expect(structure.structureName).toEqual(MAIN);
  const {
    structures: [consolation],
  } = drawStructures({ drawDefinition, stage: CONSOLATION });
  expect(consolation.structureName).toEqual(CONSOLATION);

  const result = drawStructures({ stage: CONSOLATION });
  expect(result).toHaveProperty(ERROR);
});

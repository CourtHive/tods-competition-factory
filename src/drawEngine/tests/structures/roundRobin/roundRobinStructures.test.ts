import { generateDrawTypeAndModifyDrawDefinition } from '../../../governors/structureGovernor/generateDrawTypeAndModifyDrawDefinition';
import { setStageDrawSize } from '../../../governors/entryGovernor/stageEntryCounts';
import { newDrawDefinition } from '../../../../assemblies/generators/drawDefinitions/newDrawDefinition';
import { expect, it } from 'vitest';

import { DrawDefinition } from '../../../../types/tournamentTypes';
import {
  ITEM,
  CONTAINER,
  WIN_RATIO,
  ROUND_ROBIN,
} from '../../../../constants/drawDefinitionConstants';

it('can generate Round Robin Main Draws', () => {
  let drawDefinition: DrawDefinition = newDrawDefinition();
  setStageDrawSize({ drawDefinition, stage: 'MAIN', drawSize: 16 });
  const drawType = ROUND_ROBIN;
  let structure = generateDrawTypeAndModifyDrawDefinition({
    drawDefinition,
    drawType,
  }).structures?.[0];
  expect(structure?.structureType).toEqual(CONTAINER);
  expect(structure?.finishingPosition).toEqual(WIN_RATIO);
  expect(structure?.structures?.length).toEqual(4);
  expect(structure?.structures?.[0].structureType).toEqual(ITEM);
  expect(structure?.structures?.[0].matchUps?.length).toEqual(6);

  drawDefinition = newDrawDefinition();
  setStageDrawSize({ drawDefinition, stage: 'MAIN', drawSize: 32 });
  structure = generateDrawTypeAndModifyDrawDefinition({
    drawDefinition,
    drawType,
  }).structures?.[0];
  expect(structure?.structures?.length).toEqual(8);
});

it('can generate Round Robins with varying group sizes', () => {
  let drawDefinition: DrawDefinition = newDrawDefinition();
  setStageDrawSize({ drawDefinition, stage: 'MAIN', drawSize: 30 });
  let structureOptions = { groupSize: 5 };
  let structure = generateDrawTypeAndModifyDrawDefinition({
    drawType: ROUND_ROBIN,
    structureOptions,
    drawDefinition,
  }).structures?.[0];
  expect(structure?.structures?.length).toEqual(6);
  expect(structure?.structures?.[0].matchUps?.length).toEqual(10);

  drawDefinition = newDrawDefinition();
  setStageDrawSize({ drawDefinition, stage: 'MAIN', drawSize: 30 });
  structureOptions = { groupSize: 3 };
  structure = generateDrawTypeAndModifyDrawDefinition({
    drawType: ROUND_ROBIN,
    structureOptions,
    drawDefinition,
  }).structures?.[0];
  expect(structure?.structures?.length).toEqual(10);
  expect(structure?.structures?.[0].matchUps?.length).toEqual(3);
  expect(structure?.structures?.[0].matchUps?.[0].roundNumber).toEqual(1);
  expect(structure?.structures?.[0].matchUps?.[1].roundNumber).toEqual(2);
  expect(structure?.structures?.[0].matchUps?.[0].drawPositions).toMatchObject([
    1, 2,
  ]);
  expect(structure?.structures?.[0].matchUps?.[1].drawPositions).toMatchObject([
    1, 3,
  ]);
  expect(structure?.structures?.[0].matchUps?.[2].drawPositions).toMatchObject([
    2, 3,
  ]);
});

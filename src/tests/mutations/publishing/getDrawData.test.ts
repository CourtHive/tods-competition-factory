import { getStructureGroups } from '@Query/structure/getStructureGroups';
import { getDrawData } from '@Query/drawDefinition/getDrawData';
import eliminationEvent from './eliminationMock.json';
import roundRobinEvent from './roundRobinMock.json';
import { expect, it } from 'vitest';
import { DrawDefinition } from '@Types/tournamentTypes';

it('can extract elimination structures', () => {
  const drawDefinition = eliminationEvent.drawDefinitions[0] as DrawDefinition;
  const { structureGroups, allStructuresLinked } = getStructureGroups({
    drawDefinition,
  });
  expect(allStructuresLinked).toEqual(true);
  expect(structureGroups.length).toEqual(1);
});

it('can extract round robin structures', () => {
  const drawDefinition = roundRobinEvent.drawDefinitions[0] as DrawDefinition;
  const { structureGroups, allStructuresLinked } = getStructureGroups({
    drawDefinition,
  });
  expect(allStructuresLinked).toEqual(true);
  expect(structureGroups.length).toEqual(1);

  const result = getDrawData({ drawDefinition });
  expect(result.structures?.length).toEqual(1);
  expect(result.drawInfo.drawActive).toEqual(false);
  expect(result.drawInfo.drawCompleted).toEqual(false);
  expect(result.drawInfo.drawGenerated).toEqual(true);
  expect(result.structures?.length).toEqual(1);
});

/*
it('can extract compass structures', () => {
  const event = JSON.parse(roundRobin);

  const drawDefinition = event.drawDefinitions[0];
  const { structureGroups, allStructuresLinked } = getStructureGroups({ drawDefinition });
  expect(allStructuresLinked).toEqual(true);
  expect(structureGroups.length).toEqual(1);
});
*/

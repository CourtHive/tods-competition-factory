import { getStructureGroups } from '../../../../query/structure/getStructureGroups';
import { getDrawData } from '../../../../query/drawDefinition/getDrawData';
import { expect, it } from 'vitest';
import fs from 'fs';

const elimination: any = fs.readFileSync(
  './src/tests/quarantine/tests/publishing/eliminationMock.json'
);
const roundRobin: any = fs.readFileSync(
  './src/tests/quarantine/tests/publishing/roundRobinMock.json'
);

it('can extract elimination structures', () => {
  const event = JSON.parse(elimination);

  const drawDefinition = event.drawDefinitions[0];
  const { structureGroups, allStructuresLinked } = getStructureGroups({
    drawDefinition,
  });
  expect(allStructuresLinked).toEqual(true);
  expect(structureGroups.length).toEqual(1);
});

it('can extract round robin structures', () => {
  const event = JSON.parse(roundRobin);

  const drawDefinition = event.drawDefinitions[0];
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

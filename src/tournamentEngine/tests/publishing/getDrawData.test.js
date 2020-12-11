import fs from 'fs';
import { getStructureGroups } from '../../governors/publishingGovernor/getDrawData';

const elimination = fs.readFileSync(
  './src/tournamentEngine/tests/publishing/eliminationMock.json'
);
const roundRobin = fs.readFileSync(
  './src/tournamentEngine/tests/publishing/roundRobinMock.json'
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

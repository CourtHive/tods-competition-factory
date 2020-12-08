import fs from 'fs';
import { getStructureGroups } from '../../governors/publishingGovernor/getDrawData';

const json = fs.readFileSync(
  './src/tournamentEngine/tests/publishing/eventMock.json'
);

it('can extract structures', () => {
  const event = JSON.parse(json);

  const drawDefinition = event.drawDefinitions[0];
  const { structureGroups } = getStructureGroups({ drawDefinition });
  expect(structureGroups.length).toEqual(1);
});

import fs from 'fs';
import drawEngine from '../../drawEngine/sync';
import { getDrawMatchUps } from '../../drawEngine/getters/getMatchUps/drawMatchUps';
import { getStructureMatchUps } from '../../drawEngine/getters/getMatchUps/getStructureMatchUps';
import tournamentEngine from '../../tournamentEngine/sync';
const tournamentRecordJSON = fs.readFileSync(
  './src/global/testHarness/demoTournament.json',
  'utf-8'
);
const tournamentRecord = JSON.parse(tournamentRecordJSON);
tournamentEngine.setState(tournamentRecord);

it.skip('can extract matchUps', () => {
  const {
    events: [event],
  } = tournamentRecord;
  expect(event).not.toBeUndefined();

  const { drawDefinitions } = event;
  const [drawDefinition] = drawDefinitions;
  expect(drawDefinition).not.toBeUndefined();

  let result = getDrawMatchUps({ drawDefinition });
  expect(result.completedMatchUps.length).toBeGreaterThan(0);

  const { structures } = drawDefinition;
  const [structure] = structures;
  result = getStructureMatchUps({ structure });
  expect(result.completedMatchUps.length).toBeGreaterThan(0);

  drawDefinition.entries = [];
  drawDefinition.links = [];
  result = drawEngine.load(drawDefinition);
  expect(result.success).toEqual(true);

  result = drawEngine.allDrawMatchUps({ drawDefinition });
  expect(result.matchUps.length).toBeGreaterThan(0);

  /*
  const matchUps = drawDefinitions[4].structures[0].matchUps;
  result = drawEngine.buildDrawHierarchy({ matchUps });
  console.log(result.hierarchy.children[1]);
  */
});

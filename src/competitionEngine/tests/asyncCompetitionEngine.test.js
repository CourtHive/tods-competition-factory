import { generateTournamentRecord } from '../../mocksEngine/generators/generateTournamentRecord';
import competitionEngineAsync from '../async';

it('can purge unliked tournamentRecords from competitionEngine state', async () => {
  const competitionEngine = competitionEngineAsync();
  const { tournamentRecord: firstRecord } = generateTournamentRecord();
  const { tournamentRecord: secondRecord } = generateTournamentRecord();

  let result = competitionEngine.setState([firstRecord, secondRecord]);
  expect(result.success).toEqual(true);

  result = await competitionEngine.linkTournaments();
  expect(result.success).toEqual(true);
  const { tournamentRecord: thirdRecord } = generateTournamentRecord();
  result = await competitionEngine.setTournamentRecord(thirdRecord);

  let { tournamentRecords } = await competitionEngine.getState();
  expect(Object.keys(tournamentRecords).length).toEqual(3);

  result = competitionEngine.removeUnlinkedTournamentRecords();
  expect(result.success).toEqual(true);

  ({ tournamentRecords } = await competitionEngine.getState());
  expect(Object.keys(tournamentRecords).length).toEqual(2);
});

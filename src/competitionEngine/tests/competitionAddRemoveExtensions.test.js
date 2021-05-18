import { generateTournamentRecord } from '../../mocksEngine/generators/generateTournamentRecord';
import competitionEngine from '../sync';

it('can add and remove extensions from tournamentRecords loaded into competitionEngine', () => {
  // generateTournamentRecord automatically adds new tournamentRecord to competitionEngine state
  generateTournamentRecord();
  generateTournamentRecord();

  const extensionName = 'extensionName';
  const extensionValue = 'extensionValue';
  const extension = { name: extensionName, value: extensionValue };

  let result = competitionEngine.addExtension({ extension });
  expect(result.success).toEqual(true);

  const { extension: foundExtension } = competitionEngine.findExtension({
    name: extensionName,
  });
  expect(foundExtension.name).toEqual(extensionName);

  result = competitionEngine.removeExtension({ name: extensionName });
  expect(result.success).toEqual(true);
  expect(result.removed).toEqual(2);

  const { tournamentRecords } = competitionEngine.getState();
  Object.keys(tournamentRecords).forEach((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];
    expect(tournamentRecord.extensions.length).toEqual(0);
  });
});

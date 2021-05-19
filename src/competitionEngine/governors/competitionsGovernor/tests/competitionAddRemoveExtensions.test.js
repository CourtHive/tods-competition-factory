import { generateTournamentRecord } from '../../../../mocksEngine/generators/generateTournamentRecord';
import competitionEngineAsync from '../../../async';
import competitionEngineSync from '../../../sync';

const asyncCompetitionEngine = competitionEngineAsync();

test.each([competitionEngineSync, asyncCompetitionEngine])(
  'can add and remove extensions from tournamentRecords loaded into competitionEngine',
  async (competitionEngine) => {
    // generateTournamentRecord automatically adds new tournamentRecord to competitionEngine state
    generateTournamentRecord({ competitionEngine });
    generateTournamentRecord({ competitionEngine });

    const extensionName = 'extensionName';
    const extensionValue = 'extensionValue';
    const extension = { name: extensionName, value: extensionValue };

    let result = await competitionEngine.addExtension({ extension });
    expect(result.success).toEqual(true);

    const { extension: foundExtension } = await competitionEngine.findExtension(
      {
        name: extensionName,
      }
    );
    expect(foundExtension.name).toEqual(extensionName);

    result = await competitionEngine.removeExtension({ name: extensionName });
    expect(result.success).toEqual(true);
    expect(result.removed).toEqual(2);

    const { tournamentRecords } = await competitionEngine.getState();
    Object.keys(tournamentRecords).forEach((tournamentId) => {
      const tournamentRecord = tournamentRecords[tournamentId];
      expect(tournamentRecord.extensions.length).toEqual(0);
    });
  }
);

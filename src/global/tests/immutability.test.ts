import { dateStringDaysChange } from '../../utilities/dateTime';
import competitionEngine from '../../competitionEngine/sync';
import tournamentEngine from '../../test/engines/tournamentEngine';
import mocksEngine from '../../mocksEngine';
import { expect, test } from 'vitest';

import { FACTORY } from '../../constants/extensionConstants';

test('setting deepCopy option to false will allow source objects to be modified', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  const { startDate, endDate } = tournamentRecord;

  expect(tournamentRecord.extensions).toBeUndefined();
  tournamentEngine.setState(tournamentRecord, false);

  const newStartDate = dateStringDaysChange(startDate, 1);
  let result = tournamentEngine.setTournamentStartDate({
    startDate: newStartDate,
  });
  expect(result.success).toEqual(true);

  let tournament = tournamentEngine.getTournament().tournamentRecord;
  expect(tournament.extensions).not.toBeUndefined();
  const factoryTimeStamp = tournament.extensions.find(
    (extension) => extension.name === FACTORY
  ).value.timeStamp;

  const { tournamentInfo } = tournamentEngine.getTournamentInfo();
  expect(tournamentInfo.startDate).toEqual(newStartDate);
  expect(tournamentRecord.startDate).toEqual(newStartDate);
  expect(startDate).not.toEqual(newStartDate);

  const dates = competitionEngine.getCompetitionDateRange();
  expect(dates.endDate).toEqual(endDate);

  expect(tournamentRecord.extensions).not.toBeUndefined();

  result = competitionEngine.devContext(true).addExtension({
    extension: { name: 'test', value: 'test' },
    discover: true,
  });
  expect(result.success).toEqual(true);

  const extensionNames = tournamentRecord.extensions.map(({ name }) => name);
  expect(extensionNames.includes('test')).toEqual(true);
  expect(extensionNames.includes(FACTORY)).toEqual(true);

  tournament = tournamentEngine.getTournament().tournamentRecord;
  let latestFactoryTimeStamp = tournament.extensions.find(
    (extension) => extension.name === FACTORY
  ).value.timeStamp;
  expect(factoryTimeStamp).toEqual(latestFactoryTimeStamp);

  setTimeout(() => {
    const nextStartDate = dateStringDaysChange(startDate, 1);
    result = tournamentEngine.setTournamentStartDate({
      startDate: nextStartDate,
    });
    expect(result.success).toEqual(true);

    tournament = tournamentEngine.getTournament().tournamentRecord;
    latestFactoryTimeStamp = tournament.extensions.find(
      (extension) => extension.name === FACTORY
    ).value.timeStamp;
    expect(factoryTimeStamp).not.toEqual(latestFactoryTimeStamp);
  }, 5);
});

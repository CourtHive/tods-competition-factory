import { dateStringDaysChange } from '../../utilities/dateTime';
import competitionEngine from '../../competitionEngine/sync';
import tournamentEngine from '../../tournamentEngine/sync';
import mocksEngine from '../../mocksEngine';

test('setting deepCopy option to false will allow source objects to be modified', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  const { startDate, endDate } = tournamentRecord;

  tournamentEngine.setState(tournamentRecord, false);

  const newStartDate = dateStringDaysChange(startDate, 1);
  let result = tournamentEngine.setTournamentStartDate({
    startDate: newStartDate,
  });
  expect(result.success).toEqual(true);

  const { tournamentInfo } = tournamentEngine.getTournamentInfo();
  expect(tournamentInfo.startDate).toEqual(newStartDate);
  expect(tournamentRecord.startDate).toEqual(newStartDate);
  expect(startDate).not.toEqual(newStartDate);

  const dates = competitionEngine.getCompetitionDateRange();
  expect(dates.endDate).toEqual(endDate);

  expect(tournamentRecord.extensions).toBeUndefined();

  result = competitionEngine.addExtension({
    extension: { name: 'test', value: 'test' },
  });
  expect(result.success).toEqual(true);

  expect(tournamentRecord.extensions.length).toEqual(1);
});

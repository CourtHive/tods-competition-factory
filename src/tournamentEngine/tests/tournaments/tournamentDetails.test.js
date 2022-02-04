import { dateStringDaysChange } from '../../../utilities/dateTime';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { MISSING_DATE } from '../../../constants/errorConditionConstants';

test('tournamentEngine can set tournament startDate and endDate', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  tournamentEngine.setState(tournamentRecord);
  let { tournamentInfo } = tournamentEngine.getTournamentInfo();
  const { startDate, endDate } = tournamentInfo;
  expect(startDate).not.toBeUndefined();
  expect(endDate).not.toBeUndefined();

  let result = tournamentEngine.setTournamentStartDate();
  expect(result.error).toEqual(MISSING_DATE);

  const newStartDate = dateStringDaysChange(endDate, 1);
  result = tournamentEngine.setTournamentStartDate({ startDate: newStartDate });
  expect(result.success).toEqual(true);

  ({ tournamentInfo } = tournamentEngine.getTournamentInfo());
  expect(tournamentInfo.endDate).toEqual(newStartDate);

  result = tournamentEngine.setTournamentEndDate();
  expect(result.error).toEqual(MISSING_DATE);

  const newEndDate = dateStringDaysChange(newStartDate, 7);
  result = tournamentEngine.setTournamentEndDate({ endDate: newEndDate });
  expect(result.success).toEqual(true);

  const anEarlierEndDate = dateStringDaysChange(newStartDate, -1);
  result = tournamentEngine.setTournamentEndDate({ endDate: anEarlierEndDate });
  expect(result.success).toEqual(true);

  ({ tournamentInfo } = tournamentEngine.getTournamentInfo());
  expect(tournamentInfo.startDate).toEqual(anEarlierEndDate);
});

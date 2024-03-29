import { setSubscriptions } from '@Global/state/globalState';
import { dateStringDaysChange } from '@Tools/dateTime';
import mocksEngine from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { expect, test } from 'vitest';

// constants
import { INVALID_DATE, INVALID_VALUES } from '@Constants/errorConditionConstants';
import { MODIFY_TOURNAMENT_DETAIL } from '@Constants/topicConstants';
import { IN_PROGRESS } from '@Constants/tournamentConstants';

test('tournamentEngine can set tournament startDate and endDate', () => {
  mocksEngine.generateTournamentRecord({ setState: true });
  let { tournamentInfo } = tournamentEngine.getTournamentInfo();
  const { startDate, endDate } = tournamentInfo;
  expect(startDate).not.toBeUndefined();
  expect(endDate).not.toBeUndefined();

  let result = tournamentEngine.setTournamentStartDate();
  expect(result.error).toEqual(INVALID_DATE);

  const newStartDate = dateStringDaysChange(endDate, 1);
  result = tournamentEngine.setTournamentStartDate({ startDate: newStartDate });
  expect(result.success).toEqual(true);

  ({ tournamentInfo } = tournamentEngine.getTournamentInfo());
  expect(tournamentInfo.endDate).toEqual(newStartDate);

  result = tournamentEngine.setTournamentEndDate();
  expect(result.error).toEqual(INVALID_DATE);

  const newEndDate = dateStringDaysChange(newStartDate, 7);
  result = tournamentEngine.setTournamentEndDate({ endDate: newEndDate });
  expect(result.success).toEqual(true);

  const anEarlierEndDate = dateStringDaysChange(newStartDate, -1);
  result = tournamentEngine.setTournamentEndDate({ endDate: anEarlierEndDate });
  expect(result.success).toEqual(true);

  result = tournamentEngine.setTournamentStatus({ status: 'UNKNOWN' });
  expect(result.error).toEqual(INVALID_VALUES);

  result = tournamentEngine.setTournamentStatus();
  expect(result.success).toEqual(true);

  result = tournamentEngine.setTournamentStatus({ status: IN_PROGRESS });
  expect(result.success).toEqual(true);

  ({ tournamentInfo } = tournamentEngine.getTournamentInfo());
  expect(tournamentInfo.startDate).toEqual(anEarlierEndDate);

  expect(tournamentInfo.tournamentStatus).toEqual(IN_PROGRESS);
});

test('touramentInfo includes timeItemValues', () => {
  const tournamentDetailUpdates: any[] = [];
  setSubscriptions({
    subscriptions: { [MODIFY_TOURNAMENT_DETAIL]: (payload) => tournamentDetailUpdates.push(...payload) },
  });
  mocksEngine.generateTournamentRecord({ setState: true });
  const timeItem = { itemType: 'TEST', itemValue: 'value' };
  tournamentEngine.addTournamentTimeItem({ timeItem });
  const { tournamentInfo } = tournamentEngine.getTournamentInfo();
  expect(tournamentInfo.timeItemValues).toEqual({ TEST: 'value' });
  expect(tournamentDetailUpdates.length).toEqual(1);
  expect(tournamentDetailUpdates[0].timeItemValues).toEqual({ TEST: 'value' });
});

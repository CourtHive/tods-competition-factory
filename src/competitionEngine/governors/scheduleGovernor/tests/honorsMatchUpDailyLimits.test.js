import mocksEngine from '../../../../mocksEngine';
import { unique } from '../../../../utilities';
import competitionEngine from '../../../sync';

import { DOUBLES, SINGLES } from '../../../../constants/matchUpTypes';
import { SCHEDULE_LIMITS } from '../../../../constants/extensionConstants';
import { INVALID_OBJECT } from '../../../../constants/errorConditionConstants';

it('can set and honor matchUpDailyLimits', () => {
  // ensure that tournament has exactly 16 participants
  // so that conflict can be assured for testing purposes
  const participantsCount = 16;
  const drawProfiles = [{ drawSize: participantsCount }];
  const venueProfiles = [{ courtsCount: 6 }];

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    venueProfiles,
    participantsProfile: { participantsCount },
  });

  expect(tournamentRecord.participants.length).toEqual(participantsCount);

  competitionEngine.setState([tournamentRecord]);
  const { matchUps } = competitionEngine.allCompetitionMatchUps();
  const { startDate } = competitionEngine.getCompetitionDateRange();

  const matchUpIds = matchUps.map(({ matchUpId }) => matchUpId);

  let result = competitionEngine.setMatchUpDailyLimits({});
  expect(result.error).toEqual(INVALID_OBJECT);

  const dailyLimits = {
    [DOUBLES]: 1,
    [SINGLES]: 1,
    total: 1,
  };
  result = competitionEngine.setMatchUpDailyLimits({
    dailyLimits,
  });
  expect(result.success).toEqual(true);

  result = competitionEngine.getMatchUpDailyLimitsUpdate();
  expect(result.methods.length).toEqual(1);
  expect(result.methods[0].method).toEqual('addExtension');

  result.methods.forEach((method) => {
    const { success } = competitionEngine[method.method](method.params);
    expect(success).toEqual(true);
  });

  const {
    extension: {
      value: { dailyLimits: matchUpDailyLimits },
    },
  } = competitionEngine.findExtension({
    name: SCHEDULE_LIMITS,
  });
  expect(dailyLimits).toEqual(matchUpDailyLimits);

  result = competitionEngine.scheduleMatchUps({
    matchUpDailyLimits,
    date: startDate,
    matchUpIds,
  });
  expect(result.success).toEqual(true);

  const { dateMatchUps } = competitionEngine.competitionScheduleMatchUps({
    matchUpFilters: {
      scheduledDate: startDate,
    },
  });

  const scheduledRounds = unique(dateMatchUps.map((m) => m.roundName));
  expect(scheduledRounds.includes('QF')).toEqual(false);

  result = competitionEngine.getMatchUpFormatTimingUpdate();
  expect(result.methods.length).toEqual(0);
});

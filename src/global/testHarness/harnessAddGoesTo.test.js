import { hasSchedule } from '../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/hasSchedule';
import { visualizeScheduledMatchUps } from './testUtilities/visualizeScheduledMatchUps';
import { extractTime, timeStringMinutes } from '../../utilities/dateTime';
import { competitionEngine } from '../..';
import { expect, it } from 'vitest';
import fs from 'fs';

import { DOUBLES, SINGLES } from '../../constants/matchUpTypes';

const tournamentRecordJSON = fs.readFileSync(
  './src/global/testHarness/goesToTournament.tods.json',
  'utf-8'
);

const tournamentRecord = JSON.parse(tournamentRecordJSON);
competitionEngine.setState(tournamentRecord);
const showGlobalLog = false;

it('can auto schedule matchUps which are missing winnerMatchUpId and loserMatchUpid', () => {
  let { matchUps } = competitionEngine.allCompetitionMatchUps();
  let scheduledMatchUps = matchUps.filter(hasSchedule);
  expect(scheduledMatchUps.length).toEqual(0);

  const { schedulingProfile } = competitionEngine.getSchedulingProfile();
  expect(schedulingProfile.length).toEqual(1);

  const { issuesCount } = competitionEngine.getSchedulingProfileIssues();
  expect(issuesCount).toEqual(0);

  const { startDate } = competitionEngine.getCompetitionDateRange();

  let result = competitionEngine.scheduleProfileRounds();
  let scheduledIdsCount = result.scheduledMatchUpIds[startDate].length;

  ({ matchUps } = competitionEngine.allCompetitionMatchUps({
    afterRecoveryTimes: true,
  }));
  scheduledMatchUps = matchUps.filter(hasSchedule);
  expect(scheduledMatchUps.length).toEqual(scheduledIdsCount);

  scheduledMatchUps.forEach(({ matchUpType, schedule }) => {
    const averagePlusRecovery = Math.abs(
      timeStringMinutes(extractTime(schedule.scheduledTime)) -
        timeStringMinutes(schedule.timeAfterRecovery)
    );
    if (matchUpType === SINGLES) {
      expect(schedule.recoveryMinutes).toEqual(60);
      expect(averagePlusRecovery).toEqual(150);
    } else if (matchUpType === DOUBLES) {
      expect(schedule.recoveryMinutes).toEqual(30);
      expect(averagePlusRecovery).toEqual(120);
    } else {
      expect('a bird in hand').toEqual('two in the bush');
    }
  });

  visualizeScheduledMatchUps({ scheduledMatchUps, showGlobalLog });

  const scheduleConflicts = scheduledMatchUps.filter(
    ({ schedule }) => schedule.scheduleConflict
  );
  expect(scheduleConflicts.length).toEqual(0);

  const { participantIdsWithConflicts } =
    competitionEngine.getCompetitionParticipants({
      withScheduleItems: true,
      scheduleAnalysis: true,
      withEvents: false,
      withDraws: false,
    });
  expect(participantIdsWithConflicts.length).toEqual(0);
});

import { hasSchedule } from '../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/hasSchedule';
import { visualizeScheduledMatchUps } from './testUtilities/visualizeScheduledMatchUps';
import { competitionEngine } from '../..';
import {
  extractDate,
  extractTime,
  timeStringMinutes,
} from '../../utilities/dateTime';
import fs from 'fs';

import { DOUBLES, SINGLES } from '../../constants/matchUpTypes';

const tournamentRecordJSON = fs.readFileSync(
  './src/global/testHarness/crossDateSchedulingTournament.json',
  'utf-8'
);

const tournamentRecord = JSON.parse(tournamentRecordJSON);
competitionEngine.setState(tournamentRecord);
const showGlobalLog = false;

it('can auto schedule across multiple dates', () => {
  const { schedulingProfile } = competitionEngine.getSchedulingProfile();
  expect(schedulingProfile.length).toEqual(2);
  const { issuesCount } = competitionEngine.getSchedulingProfileIssues();
  expect(issuesCount).toEqual(0);

  const jinn = false;
  let result = competitionEngine.scheduleProfileRounds({ jinn });
  const scheduledDates = result.scheduledDates.map(extractDate);
  const scheduledIdsCount = scheduledDates
    .map((scheduledDate) => result.scheduledMatchUpIds[scheduledDate].length)
    .reduce((a, b) => a + b, 0);

  const { matchUps } = competitionEngine.allCompetitionMatchUps();
  const scheduledMatchUps = matchUps.filter(hasSchedule);
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

  const { competitionParticipants, participantIdsWithConflicts } =
    competitionEngine.getCompetitionParticipants({
      withScheduleItems: true,
      scheduleAnalysis: true,
      withEvents: false,
      withDraws: false,
    });
  if (participantIdsWithConflicts.length) {
    competitionParticipants
      .filter(({ scheduleItems }) => scheduleItems.length)
      .filter(({ participantId }) =>
        participantIdsWithConflicts.includes(participantId)
      )
      .map(({ scheduleItems, scheduleConflicts }) => ({
        scheduleItems,
        scheduleConflicts,
      }))
      .forEach((conflict) => console.log(conflict));
  }
  if (!jinn) expect(participantIdsWithConflicts.length).toEqual(0);
});

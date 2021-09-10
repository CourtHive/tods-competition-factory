import { extractTime, timeStringMinutes } from '../../utilities/dateTime';
import { printGlobalLog, pushGlobalLog } from '../globalLog';
import { competitionEngine, drawEngine } from '../..';
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

  let result = competitionEngine.scheduleProfileRounds();
  let scheduledIdsCount = result.scheduledMatchUpIds.length;

  const { matchUps } = competitionEngine.allCompetitionMatchUps();
  const scheduleAttributes = ['scheduledDate', 'scheduledTime'];
  const hasSchedule = ({ schedule }) => {
    const matchUpScheduleKeys = Object.keys(schedule)
      .filter((key) => scheduleAttributes.includes(key))
      .filter((key) => schedule[key]);
    return !!matchUpScheduleKeys.length;
  };

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

  const structureIds = scheduledMatchUps.reduce(
    (structureIds, { structureId }) =>
      structureIds.includes(structureId)
        ? structureIds
        : structureIds.concat(structureId),
    []
  );

  const structureNames = Object.assign(
    {},
    ...structureIds.map((structureId) => {
      const { structureName, matchUpType } = matchUps.find(
        (matchUp) => matchUp.structureId === structureId
      );
      return {
        [structureId]: `${structureName} ${matchUpType}`,
      };
    })
  );

  structureIds.forEach((structureId) => {
    pushGlobalLog(
      {
        color: 'blue',
        method: 'draw',
        structure: structureNames[structureId],
        keyColors: {
          structure: 'magenta',
        },
      },
      true
    );
    const structureMatchUps = scheduledMatchUps.filter(
      (matchUp) => matchUp.structureId === structureId
    );
    const { roundMatchUps } = drawEngine.getRoundMatchUps({
      matchUps: structureMatchUps,
    });
    Object.keys(roundMatchUps).forEach((roundNumber) => {
      pushGlobalLog(
        {
          roundNumber,
          keyColors: {
            roundNumber: 'brightcyan',
          },
        },
        true
      );
      roundMatchUps[roundNumber].forEach(({ matchUpId, schedule }) => {
        const scheduledTime = extractTime(schedule.scheduledTime);
        pushGlobalLog(
          {
            matchUpId,
            scheduledTime,
            scheduledDate: schedule.scheduledDate,
            keyColors: {
              scheduledTime: 'brightcyan',
              scheduledDate: 'brightcyan',
              matchUpId: 'yellow',
            },
          },
          true
        );
      });
    });
  });

  if (showGlobalLog) printGlobalLog();

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

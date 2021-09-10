import { printGlobalLog, pushGlobalLog } from '../globalLog';
import { extractTime } from '../../utilities/dateTime';
import { competitionEngine, drawEngine } from '../..';
import fs from 'fs';
import { getMatchUpDependencies } from '../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/getMatchUpDependencies';

const tournamentRecordJSON = fs.readFileSync(
  './src/global/testHarness/demoTournament.json',
  'utf-8'
);

const tournamentRecord = JSON.parse(tournamentRecordJSON);
competitionEngine.setState(tournamentRecord);

it('can auto schedule', () => {
  const { schedulingProfile } = competitionEngine.getSchedulingProfile();
  expect(schedulingProfile.length).toEqual(1);
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

  const { matchUpDependencies } = getMatchUpDependencies({
    tournamentRecords: { [tournamentRecord.tournamentId]: tournamentRecord },
    matchUps,
  });
  const hasDependencies = Object.keys(matchUpDependencies).find(
    (key) => matchUpDependencies[key].matchUpIds.length
  );
  expect(!!hasDependencies).toEqual(true);

  const scheduledMatchUps = matchUps.filter(hasSchedule);

  expect(scheduledMatchUps.length).toEqual(scheduledIdsCount);

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
            keyColors: {
              scheduledTime: 'brightcyan',
              matchUpId: 'yellow',
            },
          },
          true
        );
      });
    });
  });

  printGlobalLog();
});

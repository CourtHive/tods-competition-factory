import { modifyParticipantMatchUpsCount } from '../../scheduleMatchUps/modifyParticipantMatchUpsCount';
import { updateTimeAfterRecovery } from '../../scheduleMatchUps/updateTimeAfterRecovery';
import { getMatchUpId } from '../../../../../global/functions/extractors';
import { hasSchedule } from '../../scheduleMatchUps/hasSchedule';
import { HydratedMatchUp } from '../../../../../types/hydrated';

type ProcessAlreadyScheduledMatchUpsArgs = {
  matchUpPotentialParticipantIds: { [key: string]: string[] };
  dateScheduledMatchUps?: HydratedMatchUp[];
  individualParticipantProfiles: any;
  dateScheduledMatchUpIds: string[];
  greatestAverageMinutes?: number;
  matchUpNotBeforeTimes: string[];
  matchUpScheduleTimes: string[];
  clearScheduleDates?: boolean;
  matchUps: HydratedMatchUp[];
  matchUpDependencies: any;
  scheduleDate: string;
  minutesMap: any;
};
export function processAlreadyScheduledMatchUps({
  matchUpPotentialParticipantIds,
  individualParticipantProfiles,
  dateScheduledMatchUpIds,
  greatestAverageMinutes,
  dateScheduledMatchUps,
  matchUpNotBeforeTimes,
  matchUpScheduleTimes,
  matchUpDependencies,
  clearScheduleDates,
  scheduleDate,
  minutesMap,
  matchUps,
}: ProcessAlreadyScheduledMatchUpsArgs) {
  if (!dateScheduledMatchUpIds) {
    dateScheduledMatchUps = matchUps?.filter((matchUp) => {
      const schedule = matchUp.schedule || {};
      return (
        hasSchedule({ schedule }) &&
        (!scheduleDate || matchUp.schedule.scheduledDate === scheduleDate)
      );
    });

    dateScheduledMatchUpIds = dateScheduledMatchUps.map(getMatchUpId);
  }

  // first build up a map of matchUpNotBeforeTimes and matchUpPotentialParticipantIds
  // based on already scheduled matchUps
  const clearDate = Array.isArray(clearScheduleDates)
    ? clearScheduleDates.includes(scheduleDate)
    : clearScheduleDates;

  const alreadyScheduled = clearDate
    ? []
    : matchUps.filter(({ matchUpId }) =>
        dateScheduledMatchUpIds.includes(matchUpId)
      );

  for (const matchUp of alreadyScheduled) {
    modifyParticipantMatchUpsCount({
      matchUpPotentialParticipantIds,
      individualParticipantProfiles,
      value: 1,
      matchUp,
    });

    const scheduleTime = matchUp.schedule?.scheduledTime;

    if (scheduleTime) {
      matchUpScheduleTimes[matchUp.matchUpId] = scheduleTime;
      const recoveryMinutes = minutesMap?.[matchUp.matchUpId]?.recoveryMinutes;
      const averageMatchUpMinutes = greatestAverageMinutes;
      // minutesMap?.[matchUp.matchUpId]?.averageMinutes; // for the future when variable averageMinutes supported

      updateTimeAfterRecovery({
        individualParticipantProfiles,
        matchUpPotentialParticipantIds,
        matchUpNotBeforeTimes,
        matchUpDependencies,
        averageMatchUpMinutes,
        recoveryMinutes,
        scheduleTime,
        matchUp,
      });
    }
  }

  return { clearDate, dateScheduledMatchUpIds, dateScheduledMatchUps };
}

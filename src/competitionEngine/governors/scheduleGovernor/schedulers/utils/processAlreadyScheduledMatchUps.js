import { modifyParticipantMatchUpsCount } from '../../scheduleMatchUps/modifyParticipantMatchUpsCount';
import { updateTimeAfterRecovery } from '../../scheduleMatchUps/updateTimeAfterRecovery';
import { getMatchUpId } from '../../../../../global/functions/extractors';
import { hasSchedule } from '../../scheduleMatchUps/hasSchedule';

export function processAlreadyScheduledMatchUps({
  matchUpPotentialParticipantIds,
  individualParticipantProfiles,
  greatestAverageMinutes,
  matchUpNotBeforeTimes,
  matchUpScheduleTimes,
  matchUpDependencies,
  clearScheduleDates,
  scheduleDate,
  minutesMap,
  matchUps,
}) {
  const dateScheduledMatchUps = matchUps?.filter(
    (matchUp) =>
      hasSchedule(matchUp) &&
      (!scheduleDate || matchUp.schedule.scheduledDate === scheduleDate)
  );

  const dateScheduledMatchUpIds = dateScheduledMatchUps.map(getMatchUpId);

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
      scheduleDate,
      matchUp,
      value: 1,
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

        recoveryMinutes,
        averageMatchUpMinutes,
        scheduleDate,
        scheduleTime,
        matchUp,
      });
    }
  }

  return { dateScheduledMatchUpIds };
}

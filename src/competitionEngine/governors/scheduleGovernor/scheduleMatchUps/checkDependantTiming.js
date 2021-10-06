import {
  addMinutesToTimeString,
  timeStringMinutes,
} from '../../../../utilities/dateTime';

export function checkDependendantTiming({
  matchUpScheduleTimes,
  matchUpDependencies,
  scheduleTime,
  matchUpId,
  details,
}) {
  let scheduledDependant;

  const recoveryMinutes = details.minutesMap?.[matchUpId]?.recoveryMinutes;
  const averageMatchUpMinutes = details.minutesMap?.[matchUpId]?.averageMinutes;
  const totalMinutes = (averageMatchUpMinutes || 0) + (recoveryMinutes || 0);
  const dependantNotBeforeTime = addMinutesToTimeString(
    scheduleTime,
    totalMinutes
  );

  const matchUpIdDependants =
    matchUpDependencies?.[matchUpId]?.dependantMatchUpIds || [];

  if (matchUpIdDependants.length) {
    const earliestDependant = matchUpIdDependants.reduce(
      (dependant, candidateId) => {
        const candidateScheduleTime = matchUpScheduleTimes[candidateId];
        if (!candidateScheduleTime) return dependant;

        const candidateDependant = {
          scheduleTime: candidateScheduleTime,
          matchUpId: candidateId,
        };
        if (candidateScheduleTime && !dependant.matchUpId)
          return candidateDependant;

        return timeStringMinutes(candidateScheduleTime) <
          timeStringMinutes(dependant.scheduleTime)
          ? candidateDependant
          : dependant;
      },
      {}
    );
    if (
      earliestDependant.scheduleTime &&
      timeStringMinutes(dependantNotBeforeTime) >
        timeStringMinutes(earliestDependant.scheduleTime)
    ) {
      scheduledDependant = earliestDependant;
    }
  }

  return { scheduledDependant };
}

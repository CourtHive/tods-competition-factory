import { minutesDifference, timeToDate } from '../../../../utilities/dateTime';
import { checkParticipantProfileInitialization } from './checkParticipantProfileInitialization';
import { updateTimeAfterRecovery } from './updateTimeAfterRecovery';

export function checkRecoveryTime({
  matchUpPotentialParticipantIds,
  individualParticipantProfiles,
  matchUpNotBeforeTimes,
  matchUpDependencies,

  averageMatchUpMinutes,
  recoveryMinutes,
  scheduleDate,
  scheduleTime,
  matchUp,
}) {
  const participantIdDependencies = (
    matchUpDependencies?.[matchUp.matchUpId]?.participantIds || []
  ).flat();
  const sufficientTimeForIndiiduals = participantIdDependencies.every(
    (participantId) => {
      checkParticipantProfileInitialization({
        individualParticipantProfiles,
        participantId,
      });
      let profile = individualParticipantProfiles[participantId];
      if (!profile.timeAfterRecovery) return true;
      const timeBetween = minutesDifference(
        timeToDate(profile.timeAfterRecovery),
        timeToDate(scheduleTime),
        false
      );
      return timeBetween < 0 ? false : true;
    }
  );

  const notBeforeTime = matchUpNotBeforeTimes[matchUp.matchUpId];
  const timeBetweenMatchUps = notBeforeTime
    ? minutesDifference(
        timeToDate(notBeforeTime),
        timeToDate(scheduleTime),
        false
      )
    : 0;
  const sufficientTimeBetweenMatchUps = timeBetweenMatchUps >= 0;

  const enoughTime =
    sufficientTimeForIndiiduals && sufficientTimeBetweenMatchUps;

  if (enoughTime) {
    updateTimeAfterRecovery({
      individualParticipantProfiles,
      matchUpPotentialParticipantIds,
      matchUpNotBeforeTimes,
      matchUpDependencies,

      averageMatchUpMinutes,
      recoveryMinutes,
      scheduleDate,
      scheduleTime,
      matchUp,
    });
  }

  return { enoughTime };
}

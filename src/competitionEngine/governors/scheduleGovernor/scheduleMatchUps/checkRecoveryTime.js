import { minutesDifference, timeToDate } from '../../../../utilities/dateTime';
import { getIndividualParticipantIds } from './getIndividualParticipantIds';
import { updateTimeAfterRecovery } from './updateTimeAfterRecovery';

export function checkRecoveryTime({
  matchUpPotentialParticipantIds,
  individualParticipantProfiles,
  matchUpNotBeforeTimes,
  matchUpDependencies,

  averageMatchUpMinutes,
  recoveryMinutes,
  scheduleTime,
  matchUp,
}) {
  const individualParticipantIds = getIndividualParticipantIds(matchUp);
  const sufficientTimeForIndiiduals = individualParticipantIds.every(
    (participantId) => {
      let profile = individualParticipantProfiles[participantId];
      if (!profile) {
        individualParticipantProfiles[participantId] = {};
        profile = individualParticipantProfiles[participantId];
      }
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
      scheduleTime,
      matchUp,
    });
  }

  return { enoughTime };
}

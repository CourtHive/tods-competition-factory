import { minutesDifference, timeToDate } from '../../../../utilities/dateTime';
import { getIndividualParticipantIds } from './getIndividualParticipantIds';
import { updateTimeAfterRecovery } from './updateTimeAfterRecovery';

export function checkRecoveryTime({
  matchUpPotentialParticipantIds,
  individualParticipantProfiles,
  matchUpNotBeforeTimes,
  averageMatchUpMinutes,
  recoveryMinutes,
  scheduleTime,
  matchUp,
}) {
  const individualParticipantIds = getIndividualParticipantIds(matchUp);
  const sufficientTimeForIndiiduals = individualParticipantIds.reduce(
    (isSufficient, participantId) => {
      const profile = individualParticipantProfiles[participantId];
      if (profile) {
        if (!profile.timeAfterRecovery) return isSufficient && true;
        const timeBetween = minutesDifference(
          timeToDate(profile.timeAfterRecovery),
          timeToDate(scheduleTime),
          false
        );
        if (timeBetween < 0) return false;
      }
      return isSufficient;
    },
    true
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
      averageMatchUpMinutes,
      recoveryMinutes,
      matchUp,
      individualParticipantProfiles,
      scheduleTime,
      matchUpNotBeforeTimes,
      matchUpPotentialParticipantIds,
    });
  }

  return { enoughTime };
}

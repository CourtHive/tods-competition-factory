import { getIndividualParticipantIds } from './getIndividualParticipantIds';
import { processNextMatchUps } from './processNextMatchUps';
import {
  addMinutesToTimeString,
  minutesDifference,
  timeToDate,
} from '../../../../utilities/dateTime';

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
    individualParticipantIds.forEach((participantId) => {
      const timeAfterRecovery = addMinutesToTimeString(
        scheduleTime,
        parseInt(averageMatchUpMinutes) + parseInt(recoveryMinutes)
      );
      if (!individualParticipantProfiles[participantId]) {
        individualParticipantProfiles[participantId] = {
          timeAfterRecovery,
        };
      } else {
        individualParticipantProfiles[participantId].timeAfterRecovery =
          timeAfterRecovery;
      }

      processNextMatchUps({
        matchUp,
        timeAfterRecovery,
        matchUpNotBeforeTimes,
        matchUpPotentialParticipantIds,
      });
    });
  }

  return { enoughTime };
}

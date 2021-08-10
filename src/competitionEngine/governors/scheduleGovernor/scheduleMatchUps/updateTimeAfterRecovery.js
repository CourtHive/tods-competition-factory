import { getIndividualParticipantIds } from './getIndividualParticipantIds';
import { processNextMatchUps } from './processNextMatchUps';
import {
  addMinutesToTimeString,
  extractTime,
} from '../../../../utilities/dateTime';

export function updateTimeAfterRecovery({
  averageMatchUpMinutes,
  recoveryMinutes,

  matchUp,
  individualParticipantProfiles,

  scheduleTime,
  matchUpNotBeforeTimes,
  matchUpPotentialParticipantIds,
}) {
  const endTime = extractTime(matchUp?.schedule?.endTime);
  const timeAfterRecovery = endTime
    ? addMinutesToTimeString(endTime, parseInt(recoveryMinutes))
    : addMinutesToTimeString(
        scheduleTime,
        parseInt(averageMatchUpMinutes) + parseInt(recoveryMinutes)
      );
  const individualParticipantIds = getIndividualParticipantIds(matchUp);
  individualParticipantIds.forEach((participantId) => {
    if (!individualParticipantProfiles[participantId]) {
      individualParticipantProfiles[participantId] = {
        timeAfterRecovery,
        afterRecoveryTimes: [timeAfterRecovery],
      };
    } else {
      individualParticipantProfiles[participantId].timeAfterRecovery =
        timeAfterRecovery;
      individualParticipantProfiles[participantId].afterRecoveryTimes.push(
        timeAfterRecovery
      );
    }
  });
  processNextMatchUps({
    matchUp,
    timeAfterRecovery,
    matchUpNotBeforeTimes,
    matchUpPotentialParticipantIds,
  });
}

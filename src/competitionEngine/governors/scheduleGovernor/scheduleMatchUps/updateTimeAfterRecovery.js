import { getIndividualParticipantIds } from './getIndividualParticipantIds';
import { processNextMatchUps } from './processNextMatchUps';
import {
  addMinutesToTimeString,
  extractTime,
} from '../../../../utilities/dateTime';

export function updateTimeAfterRecovery({
  averageMatchUpMinutes,
  formatChangeRecoveryMinutes,
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
  const formatChangeTimeAfterRecovery = endTime
    ? addMinutesToTimeString(extractTime(endTime), formatChangeRecoveryMinutes)
    : addMinutesToTimeString(
        scheduleTime,
        parseInt(averageMatchUpMinutes) + parseInt(formatChangeRecoveryMinutes)
      );
  const individualParticipantIds = getIndividualParticipantIds(matchUp);
  individualParticipantIds.forEach((participantId) => {
    if (!individualParticipantProfiles[participantId]) {
      individualParticipantProfiles[participantId] = {
        timeAfterRecovery,
        formatChangeTimeAfterRecovery,
        priorMatchUpType: matchUp.matchUpType,
      };
    } else {
      const matchUpTypeChange =
        individualParticipantIds[participantId].priorMatchUpType !==
        matchUp.matchUpType;

      // if matchUpType of previous matchUp is different, use formatChangeTimeAfterRecovery (if available)
      individualParticipantProfiles[participantId].timeAfterRecovery =
        matchUpTypeChange
          ? formatChangeTimeAfterRecovery || timeAfterRecovery
          : timeAfterRecovery;
    }
  });
  processNextMatchUps({
    matchUp,
    timeAfterRecovery,
    matchUpNotBeforeTimes,
    matchUpPotentialParticipantIds,
  });
}

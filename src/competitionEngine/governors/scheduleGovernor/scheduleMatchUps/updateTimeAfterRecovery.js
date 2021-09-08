import { processNextMatchUps } from './processNextMatchUps';
import {
  addMinutesToTimeString,
  extractTime,
} from '../../../../utilities/dateTime';

export function updateTimeAfterRecovery({
  individualParticipantProfiles,

  matchUpPotentialParticipantIds,
  matchUpNotBeforeTimes,
  matchUpDependencies,

  averageMatchUpMinutes,
  formatChangeRecoveryMinutes,
  recoveryMinutes,
  scheduleTime,
  matchUp,
}) {
  const endTime = extractTime(matchUp?.schedule?.endTime);
  const timeAfterRecovery = endTime
    ? addMinutesToTimeString(endTime, parseInt(recoveryMinutes))
    : addMinutesToTimeString(
        scheduleTime,
        parseInt(averageMatchUpMinutes) + parseInt(recoveryMinutes)
      );
  const typeChangeTimeAfterRecovery =
    formatChangeRecoveryMinutes &&
    (endTime
      ? addMinutesToTimeString(
          extractTime(endTime),
          formatChangeRecoveryMinutes
        )
      : addMinutesToTimeString(
          scheduleTime,
          parseInt(averageMatchUpMinutes) +
            parseInt(formatChangeRecoveryMinutes)
        ));
  const participantIdDependencies =
    matchUpDependencies?.[matchUp.matchUpId]?.participantIds || [];

  participantIdDependencies.forEach((participantId) => {
    if (!individualParticipantProfiles[participantId]) {
      individualParticipantProfiles[participantId] = {
        timeAfterRecovery,
        typeChangeTimeAfterRecovery,
        priorMatchUpType: matchUp.matchUpType,
      };
    } else {
      const matchUpTypeChange =
        individualParticipantProfiles[participantId].priorMatchUpType !==
        matchUp.matchUpType;

      // if matchUpType of previous matchUp is different, use typeChangeTimeAfterRecovery (if available)
      individualParticipantProfiles[participantId].timeAfterRecovery =
        matchUpTypeChange
          ? typeChangeTimeAfterRecovery || timeAfterRecovery
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

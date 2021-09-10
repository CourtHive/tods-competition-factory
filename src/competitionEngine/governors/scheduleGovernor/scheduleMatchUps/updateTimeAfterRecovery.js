import { checkParticipantProfileInitialization } from './checkParticipantProfileInitialization';
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
  typeChangeRecoveryMinutes,
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
    typeChangeRecoveryMinutes &&
    (endTime
      ? addMinutesToTimeString(extractTime(endTime), typeChangeRecoveryMinutes)
      : addMinutesToTimeString(
          scheduleTime,
          parseInt(averageMatchUpMinutes) + parseInt(typeChangeRecoveryMinutes)
        ));
  const participantIdDependencies =
    matchUpDependencies?.[matchUp.matchUpId]?.participantIds || [];

  participantIdDependencies.forEach((participantId) => {
    checkParticipantProfileInitialization({
      individualParticipantProfiles,
      participantId,
    });
    const matchUpTypeChange =
      individualParticipantProfiles[participantId].priorMatchUpType !==
      matchUp.matchUpType;

    // if matchUpType of previous matchUp is different, use typeChangeTimeAfterRecovery (if available)
    individualParticipantProfiles[participantId].timeAfterRecovery =
      matchUpTypeChange
        ? typeChangeTimeAfterRecovery || timeAfterRecovery
        : timeAfterRecovery;
  });
  processNextMatchUps({
    matchUp,
    timeAfterRecovery,
    matchUpNotBeforeTimes,
    matchUpPotentialParticipantIds,
  });
}

import { getIndividualParticipantIds } from './getIndividualParticipantIds';
import { addMinutesToTimeString } from '../../../../utilities/dateTime';
import { processNextMatchUps } from './processNextMatchUps';

export function updateTimeAfterRecovery({
  averageMatchUpMinutes,
  recoveryMinutes,

  matchUp,
  individualParticipantProfiles,

  scheduleTime,
  matchUpNotBeforeTimes,
  matchUpPotentialParticipantIds,
}) {
  const timeAfterRecovery = addMinutesToTimeString(
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
    individualParticipantIds,
    matchUpPotentialParticipantIds,
  });
}

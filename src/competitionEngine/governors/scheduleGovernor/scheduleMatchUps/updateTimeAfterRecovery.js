import { getIndividualParticipantIds } from './getIndividualParticipantIds';
import { processNextMatchUps } from './processNextMatchUps';
import {
  addParticipantPotentialRecovery,
  checkParticipantProfileInitialization,
} from './checkParticipantProfileInitialization';
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

  const { potentialIndividualParticipantIds } =
    getIndividualParticipantIds(matchUp);

  participantIdDependencies.forEach((participantId) => {
    checkParticipantProfileInitialization({
      individualParticipantProfiles,
      participantId,
    });

    // check whether this participantId is potential or actual for this matchUp
    // IF: potential, ONLY keep track of timeAfterRecovery in .potentialRecovery[drawId]
    if (potentialIndividualParticipantIds.includes(participantId)) {
      addParticipantPotentialRecovery({
        individualParticipantProfiles,
        drawId: matchUp.drawId,
        participantId,

        typeChangeTimeAfterRecovery,
        timeAfterRecovery,
      });
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

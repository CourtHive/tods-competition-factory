import { processNextMatchUps } from './processNextMatchUps';
import {
  addParticipantPotentialRecovery,
  checkParticipantProfileInitialization,
} from './checkParticipantProfileInitialization';
import {
  addMinutesToTimeString,
  extractTime,
} from '../../../../utilities/dateTime';

import { HydratedMatchUp } from '../../../../types/hydrated';

type UpdateTimeAfterRecoveryArgs = {
  matchUpPotentialParticipantIds: { [key: string]: string[] };
  matchUpNotBeforeTimes: { [key: string]: any };
  matchUpDependencies: { [key: string]: any };
  typeChangeRecoveryMinutes?: string;
  individualParticipantProfiles: any;
  averageMatchUpMinutes?: number;
  recoveryMinutes?: number;
  scheduleTime: string;
  matchUp: HydratedMatchUp;
};
export function updateTimeAfterRecovery({
  matchUpPotentialParticipantIds,
  individualParticipantProfiles,
  typeChangeRecoveryMinutes,
  averageMatchUpMinutes = 0,
  matchUpNotBeforeTimes,
  matchUpDependencies,
  recoveryMinutes = 0,
  scheduleTime,
  matchUp,
}: UpdateTimeAfterRecoveryArgs) {
  const endTime = extractTime(matchUp?.schedule?.endTime);
  const timeAfterRecovery = endTime
    ? addMinutesToTimeString(endTime, parseInt(recoveryMinutes.toString()))
    : addMinutesToTimeString(
        scheduleTime,
        parseInt(averageMatchUpMinutes.toString()) +
          parseInt(recoveryMinutes.toString())
      );

  const typeChangeTimeAfterRecovery =
    typeChangeRecoveryMinutes &&
    (endTime
      ? addMinutesToTimeString(extractTime(endTime), typeChangeRecoveryMinutes)
      : addMinutesToTimeString(
          scheduleTime,
          parseInt(averageMatchUpMinutes.toString()) +
            parseInt(typeChangeRecoveryMinutes)
        ));
  const participantIdDependencies =
    matchUpDependencies?.[matchUp.matchUpId]?.participantIds || [];

  const potentialIndividualParticipantIds = (
    (matchUp.roundPosition &&
      matchUpPotentialParticipantIds[matchUp.matchUpId]) ||
    []
  ).flat();

  participantIdDependencies.forEach((participantId) => {
    checkParticipantProfileInitialization({
      individualParticipantProfiles,
      participantId,
    });

    const matchUpTypeChange =
      individualParticipantProfiles[participantId].priorMatchUpType !==
      matchUp.matchUpType;

    // if matchUpType of previous matchUp is different, use typeChangeTimeAfterRecovery (if available)
    const recoveryValue = matchUpTypeChange
      ? typeChangeTimeAfterRecovery || timeAfterRecovery
      : timeAfterRecovery;

    // check whether this participantId is potential or actual for this matchUp
    if (potentialIndividualParticipantIds.includes(participantId)) {
      addParticipantPotentialRecovery({
        individualParticipantProfiles,
        drawId: matchUp.drawId,
        recoveryValue,
        participantId,
        scheduleTime,
      });
    } else {
      individualParticipantProfiles[participantId].timeAfterRecovery =
        recoveryValue;

      individualParticipantProfiles[participantId].bookings.push({
        scheduleTime,
        timeAfterRecovery: recoveryValue,
      });
    }
  });

  processNextMatchUps({
    matchUpPotentialParticipantIds,
    matchUpNotBeforeTimes,
    timeAfterRecovery,
    matchUp,
  });
}

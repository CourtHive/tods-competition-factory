import { getIndividualParticipantIds } from './getIndividualParticipantIds';

export function processNextMatchUps({
  matchUp,
  timeAfterRecovery,
  matchUpNotBeforeTimes,
  matchUpPotentialParticipantIds,
}) {
  const individualParticipantIds = getIndividualParticipantIds(matchUp);

  const addPotentialParticipantIds = (targetMatchUpId) => {
    if (!matchUpPotentialParticipantIds[targetMatchUpId])
      matchUpPotentialParticipantIds[targetMatchUpId] = [];

    // push potentials as an array so that if any have progressed to target matchUp
    // others in the array can be identfied as no longer potentials
    matchUpPotentialParticipantIds[targetMatchUpId].push(
      individualParticipantIds
    );
  };

  // It is necessary to only update timeAfterRecovery if value is greater...
  // ...to account for source matchUps having earlier timeAfterRecovery
  // e.g. roundPosition 1 matchUp timeAfterRecovery is 11:00 but
  // roundPosition 2 matchUp timeAfterRecover is 9:30
  // and the last one to be processed shouldn't overwrite later value
  const updateTimeAfterRecovery = (matchUpId) => {
    if (
      !matchUpNotBeforeTimes[matchUpId] ||
      timeAfterRecovery > matchUpNotBeforeTimes[matchUpId]
    ) {
      matchUpNotBeforeTimes[matchUpId] = timeAfterRecovery;
    }
  };

  const winnerMatchUpId =
    matchUp.winnerTo?.matchUpId || matchUp.winnerMatchUpId;
  if (winnerMatchUpId) {
    timeAfterRecovery && updateTimeAfterRecovery(winnerMatchUpId);
    addPotentialParticipantIds(winnerMatchUpId);
  }
  const loserMatchUpId = matchUp.loserTo?.matchUpId || matchUp.loserMatchUpId;
  if (loserMatchUpId) {
    timeAfterRecovery && updateTimeAfterRecovery(loserMatchUpId);
    addPotentialParticipantIds(loserMatchUpId);
  }
  if (matchUp.sidesTo?.length) {
    matchUp.sidesTo.forEach(({ matchUpId }) => {
      if (matchUpId) {
        timeAfterRecovery && updateTimeAfterRecovery(matchUpId);
        addPotentialParticipantIds(matchUpId);
      }
    });
  }
}

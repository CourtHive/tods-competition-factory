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

  if (matchUp.winnerTo?.matchUpId) {
    matchUpNotBeforeTimes[matchUp.winnerTo.matchUpId] = timeAfterRecovery;
    addPotentialParticipantIds(matchUp.winnerTo.matchUpId);
  }
  if (matchUp.loserTo?.matchUpId) {
    matchUpNotBeforeTimes[matchUp.loserTo.matchUpId] = timeAfterRecovery;
    addPotentialParticipantIds(matchUp.loserTo.matchUpId);
  }
  if (matchUp.sidesTo?.length) {
    matchUp.sidesTo.forEach(({ matchUpId }) => {
      if (matchUpId) {
        matchUpNotBeforeTimes[matchUpId] = timeAfterRecovery;
        addPotentialParticipantIds(matchUpId);
      }
    });
  }
}

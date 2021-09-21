import { getIndividualParticipantIds } from './getIndividualParticipantIds';
import { unique } from '../../../../utilities';

export function processNextMatchUps({
  matchUpPotentialParticipantIds,
  matchUpNotBeforeTimes,
  timeAfterRecovery,
  matchUp,
}) {
  const { individualParticipantIds } = getIndividualParticipantIds(matchUp);
  timeAfterRecovery = timeAfterRecovery || matchUp.schedule?.timeAfterRecovery;

  const addPotentialParticipantIds = (targetMatchUpId) => {
    if (!matchUpPotentialParticipantIds[targetMatchUpId])
      matchUpPotentialParticipantIds[targetMatchUpId] = [];

    // push potentials as an array so that if any have progressed to target matchUp
    // others in the array can be identfied as no longer potentials
    matchUpPotentialParticipantIds[targetMatchUpId] = unique(
      matchUpPotentialParticipantIds[targetMatchUpId].concat(
        ...individualParticipantIds
      )
    );
  };

  // It is necessary to only update timeAfterRecovery if value is greater...
  // ...to account for source matchUps having earlier timeAfterRecovery
  // e.g. roundPosition 1 matchUp timeAfterRecovery is 11:00 but
  // roundPosition 2 matchUp timeAfterRecovery is 9:30
  // and the last one to be processed shouldn't overwrite later value
  const updateNotBeforeTime = (matchUpId) => {
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
    timeAfterRecovery && updateNotBeforeTime(winnerMatchUpId);
    addPotentialParticipantIds(winnerMatchUpId);
  }
  const loserMatchUpId = matchUp.loserTo?.matchUpId || matchUp.loserMatchUpId;
  if (loserMatchUpId) {
    timeAfterRecovery && updateNotBeforeTime(loserMatchUpId);
    addPotentialParticipantIds(loserMatchUpId);
  }
  if (matchUp.sidesTo?.length) {
    matchUp.sidesTo.forEach(({ matchUpId }) => {
      if (matchUpId) {
        timeAfterRecovery && updateNotBeforeTime(matchUpId);
        addPotentialParticipantIds(matchUpId);
      }
    });
  }
}

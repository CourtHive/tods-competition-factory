import { getIndividualParticipantIds } from './getIndividualParticipantIds';
import { overlap } from '../../../../utilities';

import { TOTAL } from '../../../../constants/scheduleConstants';

// IMPORTANT: participant counts should only be incremented for ONE potential matchUp per draw
// TODO: add ability to track which draw a potential has been incremented from...
export function modifyParticipantMatchUpsCount({
  matchUpPotentialParticipantIds,
  individualParticipantProfiles,
  matchUp,
  value,
}) {
  const { matchUpType } = matchUp;

  // individualParticipantIds represent those participants already present
  const individualParticipantIds = getIndividualParticipantIds(matchUp);
  // potentialParticipantIds are those who could progress to this matchUp
  const potentialParticipantIds =
    matchUpPotentialParticipantIds[matchUp.matchUpId] || [];

  // filteredPotentials exclude potentials if any of the participantIds
  // are present in individualParticipantIds which ensures that source match losers
  // do not get considered when incrementing or decrementing matchUp counters
  const filteredPotentials = potentialParticipantIds
    .filter((potentials) => !overlap(potentials, individualParticipantIds))
    .flat();
  const consideredParticipantIds = [
    ...individualParticipantIds,
    ...filteredPotentials,
  ];

  consideredParticipantIds.forEach((participantId) => {
    if (!individualParticipantProfiles[participantId]) {
      individualParticipantProfiles[participantId] = {
        counters: {},
        timeAfterRecovery: undefined,
        priorMatchUpType: undefined,
      };
    }
    const counters = individualParticipantProfiles[participantId].counters;
    if (counters[matchUpType]) counters[matchUpType] += value;
    else if (value > 0) counters[matchUpType] = value;
    if (counters[TOTAL]) counters[TOTAL] += value;
    else if (value > 0) counters[TOTAL] = value;
  });
}

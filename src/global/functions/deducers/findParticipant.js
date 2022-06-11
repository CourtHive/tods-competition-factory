import { getScaleValues } from '../../../tournamentEngine/getters/participants/getScaleValues';
import { attributeFilter, makeDeepCopy } from '../../../utilities';

import { POLICY_TYPE_PARTICIPANT } from '../../../constants/policyConstants';

export function findParticipant({
  tournamentParticipants = [],
  policyDefinitions = {},
  contextProfile,
  participantId,
  personId,
}) {
  const participant = tournamentParticipants.find(
    (candidate) =>
      (participantId && candidate.participantId === participantId) ||
      (personId && candidate.person && candidate.person.personId === personId)
  );

  if (participant) {
    const participantAttributes = policyDefinitions?.[POLICY_TYPE_PARTICIPANT];

    if (contextProfile?.withScaleValues) {
      const { ratings, rankings } = getScaleValues({ participant });
      participant.ratings = ratings;
      participant.rankings = rankings;
    }

    if (participantAttributes?.participant) {
      const filteredParticipant = attributeFilter({
        template: participantAttributes.participant,
        source: participant,
      });
      return makeDeepCopy(filteredParticipant);
    }
  }

  return makeDeepCopy(participant);
}

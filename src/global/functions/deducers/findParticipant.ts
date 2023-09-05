import { getScaleValues } from '../../../tournamentEngine/getters/participants/getScaleValues';
import { attributeFilter, makeDeepCopy } from '../../../utilities';

import { ContextProfile, PolicyDefinitions } from '../../../types/factoryTypes';
import { POLICY_TYPE_PARTICIPANT } from '../../../constants/policyConstants';
import { Participant } from '../../../types/tournamentFromSchema';

type HydratedParticipant = {
  [key: string | number | symbol]: unknown;
} & Participant;

type FindParticipantArgs = {
  tournamentParticipants: Participant[];
  policyDefinitions?: PolicyDefinitions;
  contextProfile?: ContextProfile;
  participantId?: string;
  internalUse?: boolean;
  personId?: string;
};

export function findParticipant({
  tournamentParticipants = [],
  policyDefinitions = {},
  contextProfile,
  participantId,
  internalUse,
  personId,
}: FindParticipantArgs): HydratedParticipant | undefined {
  const foundParticipant = tournamentParticipants.find(
    (candidate) =>
      (participantId && candidate.participantId === participantId) ||
      (personId && candidate.person && candidate.person.personId === personId)
  );

  const participant = makeDeepCopy(foundParticipant, false, internalUse);

  if (participant) {
    const participantAttributes = policyDefinitions?.[POLICY_TYPE_PARTICIPANT];

    if (contextProfile?.withScaleValues) {
      const { ratings, rankings } = getScaleValues({ participant });
      participant.rankings = rankings;
      participant.ratings = ratings;
    }

    if (participantAttributes?.participant) {
      return attributeFilter({
        template: participantAttributes.participant,
        source: participant,
      });
    }
  }

  return participant;
}

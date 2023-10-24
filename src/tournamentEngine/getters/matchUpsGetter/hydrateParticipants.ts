import { addParticipantGroupings } from '../../../drawEngine/governors/positionGovernor/avoidance/addParticipantGroupings';
import { addNationalityCode } from '../../governors/participantGovernor/addNationalityCode';
import { getScaleValues } from '../participants/getScaleValues';

import { getParticipantMap } from '../participants/getParticipantMap';
import { Tournament } from '../../../types/tournamentFromSchema';
import { HydratedParticipant } from '../../../types/hydrated';
import { makeDeepCopy } from '../../../utilities';
import {
  ContextProfile,
  ParticipantsProfile,
  PolicyDefinitions,
} from '../../../types/factoryTypes';

type HydrateParticipantsArgs = {
  participantsProfile?: ParticipantsProfile;
  policyDefinitions?: PolicyDefinitions;
  contextProfile?: ContextProfile;
  tournamentRecord: Tournament;
  useParticipantMap?: boolean;
  inContext?: boolean;
};
export function hydrateParticipants({
  participantsProfile,
  useParticipantMap,
  tournamentRecord,
  contextProfile,
  inContext,
}: HydrateParticipantsArgs) {
  if (useParticipantMap) {
    const participantMap = getParticipantMap({
      ...participantsProfile,
      ...contextProfile,
      tournamentRecord,
    })?.participantMap;

    return { participantMap };
  }

  let participants: HydratedParticipant[] =
    makeDeepCopy(tournamentRecord.participants, false, true) || [];

  if (participantsProfile?.withIOC || participantsProfile?.withISO2)
    participants.forEach((participant) =>
      addNationalityCode({ participant, ...participantsProfile })
    );

  if (
    (inContext || participantsProfile?.withGroupings) &&
    participants?.length
  ) {
    participants = addParticipantGroupings({
      participantsProfile,
      participants,
    });
  }

  if (participantsProfile?.withScaleValues && participants?.length) {
    for (const participant of participants) {
      const { ratings, rankings } = getScaleValues({ participant });
      participant.rankings = rankings;
      participant.ratings = ratings;
    }
  }

  return { participants };
}

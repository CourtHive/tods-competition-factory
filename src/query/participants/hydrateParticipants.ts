import { addParticipantGroupings } from '@Query/drawDefinition/avoidance/addParticipantGroupings';
import { addNationalityCode } from '@Query/participants/addNationalityCode';
import { getScaleValues } from '../participant/getScaleValues';
import { makeDeepCopy } from '@Tools/makeDeepCopy';

import { getParticipantMap } from './getParticipantMap';
import { Tournament } from '@Types/tournamentTypes';
import { HydratedParticipant } from '@Types/hydrated';
import { ContextProfile, ParticipantsProfile, PolicyDefinitions } from '@Types/factoryTypes';

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

  let participants: HydratedParticipant[] = makeDeepCopy(tournamentRecord.participants, false, true) || [];

  if (participantsProfile?.withIOC || participantsProfile?.withISO2)
    participants.forEach((participant) => addNationalityCode({ participant, ...participantsProfile }));

  let groupInfo;
  if ((inContext || participantsProfile?.withGroupings) && participants?.length) {
    ({ participantsWithGroupings: participants, groupInfo } = addParticipantGroupings({
      participantsProfile,
      deepCopy: false,
      participants,
    }));
  }

  if (participantsProfile?.withScaleValues && participants?.length) {
    for (const participant of participants) {
      const { ratings, rankings } = getScaleValues({ participant });
      participant.rankings = rankings;
      participant.ratings = ratings;
    }
  }

  return { participants, groupInfo };
}

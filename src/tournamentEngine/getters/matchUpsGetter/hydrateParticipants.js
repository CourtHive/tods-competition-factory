import { addParticipantGroupings } from '../../../drawEngine/governors/positionGovernor/avoidance/addParticipantGroupings';
import { addNationalityCode } from '../../governors/participantGovernor/addNationalityCode';
import { getParticipantMap } from '../participants/getParticipantMap';
import { getScaleValues } from '../participants/getScaleValues';

export function hydrateParticipants({
  participantsProfile,
  useParticipantMap,
  policyDefinitions,
  tournamentRecord,
  contextProfile,
  inContext,
}) {
  if (useParticipantMap) {
    const participantMap = getParticipantMap({
      ...participantsProfile,
      ...contextProfile,
      policyDefinitions,
      tournamentRecord,
      inContext,
    })?.participantMap;

    return { participantMap };
  }

  let participants = tournamentRecord.participants || [];

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

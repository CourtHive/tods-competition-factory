import { OTHER } from '../../../constants/participantRoles';
import { GROUP } from '../../../constants/participantTypes';
import { UUID } from '../../../utilities';

// TODO: integrity check to insure that participantIds to add are participantType: INDIVIDUAL
// would require that tournamentRecord be loaded in tournamentEngine

export function createGroupParticipant({
  groupName,
  participantId,
  individualParticipantIds = [],
  participantRole = OTHER,
}) {
  const groupParticipant = {
    participantId: participantId || UUID(),
    participantType: GROUP,
    participantRole,
    participantName: groupName,
    name: groupName, // for backwards compatability
    individualParticipantIds,
  };

  return { participant: groupParticipant };
}

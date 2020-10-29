import { OTHER } from '../../../constants/participantRoles';
import { GROUP } from '../../../constants/participantTypes';
import { UUID } from '../../../utilities';

// TODO: integrity check to insure that participantIds to add are participantType: INDIVIDUAL
// would require that tournamentRecord be loaded in tournamentEngine

export function createGroupParticipant({
  groupName,
  individualParticipantIds = [],
  participantRole = OTHER,
}) {
  const groupParticipant = {
    participantId: UUID(),
    participantType: GROUP,
    participantRole,
    name: groupName,
    individualParticipantIds,
  };

  return { participant: groupParticipant };
}

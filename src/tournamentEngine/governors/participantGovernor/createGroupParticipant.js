import { ASSOCIATION } from '../../../constants/participantRoles';
import { GROUP } from '../../../constants/participantTypes';
import { UUID } from '../../../utilities';

export function createGroupParticipant({
  groupName,
  individualParticipantIds = [],
  participantRole = ASSOCIATION,
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

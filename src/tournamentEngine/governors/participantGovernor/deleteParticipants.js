import { SUCCESS } from '../../../constants/resultConstants';
import { removeParticipantsFromAllTeams } from './participantGroupings';

export function deleteParticipants({ tournamentRecord, participantIds }) {
  if (!tournamentRecord) return { error: 'Missing tournament record' };
  if (!participantIds?.length) return { error: 'Missing participantIds' };
  if (!tournamentRecord.participants) tournamentRecord.participants = [];
  const participantsCount = tournamentRecord.participants?.length;
  if (!participantsCount) return { error: 'Tournament has no participants' };

  tournamentRecord.participants = tournamentRecord.participants.filter(
    participant => !participantIds.includes(participant.participantId)
  );
  const participantsRemovedCount =
    participantsCount - tournamentRecord.participants.length;

  removeParticipantsFromAllTeams({ tournamentRecord, participantIds });
  return participantsRemovedCount
    ? SUCCESS
    : { error: 'Not all participants deleted' };
}

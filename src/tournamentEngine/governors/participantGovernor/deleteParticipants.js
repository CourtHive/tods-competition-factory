import { removeParticipantsFromAllTeams } from './participantGroupings';

import {
  MISSING_PARTICIPANT_IDS,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function deleteParticipants({ tournamentRecord, participantIds }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantIds?.length) return { error: MISSING_PARTICIPANT_IDS };
  if (!tournamentRecord.participants) tournamentRecord.participants = [];
  const participantsCount = tournamentRecord.participants?.length;
  if (!participantsCount) return { error: 'Tournament has no participants' };

  tournamentRecord.participants = tournamentRecord.participants.filter(
    (participant) => !participantIds.includes(participant.participantId)
  );
  const participantsRemovedCount =
    participantsCount - tournamentRecord.participants.length;

  removeParticipantsFromAllTeams({ tournamentRecord, participantIds });
  return participantsRemovedCount
    ? SUCCESS
    : { error: 'Not all participants deleted' };
}

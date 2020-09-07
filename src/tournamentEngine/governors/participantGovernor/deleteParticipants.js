

import { SUCCESS } from "competitionFactory/constants/resultConstants";
import { removeParticipantsFromAllTeams } from "./participantGroupings";

export function deleteParticipants({tournamentRecord, participantIds}) {
  if (!tournamentRecord) return { error: 'Missing tournament record' };
  if (!tournamentRecord.participants) tournamentRecord.participants = [];
  const participantsCount = tournamentRecord.participants.length;
  tournamentRecord.participants = tournamentRecord.participants
    .filter(p => !participantIds.includes(p.participantId));
  const participantsRemoved = tournamentRecord.participants.length !== participantsCount;

  removeParticipantsFromAllTeams({tournamentRecord, participantIds});
  return participantsRemoved ? SUCCESS : { error: 'Not all participants deleted' };
};

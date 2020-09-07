import { findTournamentParticipant } from 'src/tournamentEngine/getters/participantGetter';
import { participantScaleItem } from 'src/tournamentEngine/accessors/participantScaleItem';

export function getParticipantScaleItem({tournamentRecord, participantId, scaleAttributes}) {
  const {participant} = findTournamentParticipant({tournamentRecord, participantId});
  if (!participant) return { error: 'Participant Not Found' };
  return participantScaleItem({participant, scaleAttributes});
}
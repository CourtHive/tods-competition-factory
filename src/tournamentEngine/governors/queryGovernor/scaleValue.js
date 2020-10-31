import { findTournamentParticipant } from '../../getters/participantGetter';
import { participantScaleItem } from '../../accessors/participantScaleItem';

export function getParticipantScaleItem({
  tournamentRecord,
  participantId,
  scaleAttributes,
}) {
  const { participant } = findTournamentParticipant({
    tournamentRecord,
    participantId,
  });

  if (!participant) return { error: 'Participant Not Found' };
  return participantScaleItem({ participant, scaleAttributes });
}

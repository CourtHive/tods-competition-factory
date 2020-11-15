import { findTournamentParticipant } from '../../getters/participantGetter';
import { participantScaleItem } from '../../accessors/participantScaleItem';
import { PARTICIPANT_NOT_FOUND } from '../../../constants/errorConditionConstants';

export function getParticipantScaleItem({
  tournamentRecord,
  participantId,
  scaleAttributes,
}) {
  const { participant } = findTournamentParticipant({
    tournamentRecord,
    participantId,
  });

  if (!participant) return { error: PARTICIPANT_NOT_FOUND };
  return participantScaleItem({ participant, scaleAttributes });
}

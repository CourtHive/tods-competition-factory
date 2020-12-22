import { findTournamentParticipant } from '../../getters/participantGetter';
import { participantScaleItem } from '../../accessors/participantScaleItem';
import {
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function getParticipantScaleItem({
  tournamentRecord,
  participantId,
  scaleAttributes,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const { participant } = findTournamentParticipant({
    tournamentRecord,
    participantId,
  });

  if (!participant) return { error: PARTICIPANT_NOT_FOUND };
  return participantScaleItem({ participant, scaleAttributes });
}

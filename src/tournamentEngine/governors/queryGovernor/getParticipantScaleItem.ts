import { findTournamentParticipant } from '../../getters/participants/participantGetter';
import {
  ScaleItem,
  participantScaleItem,
} from '../../accessors/participantScaleItem';
import {
  ErrorType,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function getParticipantScaleItem({
  tournamentRecord,
  scaleAttributes,
  participantId,
}): { error?: ErrorType; scaleItem?: ScaleItem } {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const { participant } = findTournamentParticipant({
    tournamentRecord,
    participantId,
  });

  if (!participant) return { error: PARTICIPANT_NOT_FOUND };
  return participantScaleItem({ participant, scaleAttributes });
}

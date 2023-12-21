import { findTournamentParticipant } from '../../acquire/findTournamentParticipant';
import { participantScaleItem } from './participantScaleItem';

import { ScaleAttributes, ScaleItem } from '../../types/factoryTypes';
import { Tournament } from '../../types/tournamentTypes';
import {
  ErrorType,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_NOT_FOUND,
} from '../../constants/errorConditionConstants';

type GetParticipantScaleItemArgs = {
  scaleAttributes: ScaleAttributes;
  tournamentRecord: Tournament;
  participantId: string;
};
export function getParticipantScaleItem({
  tournamentRecord,
  scaleAttributes,
  participantId,
}: GetParticipantScaleItemArgs): { error?: ErrorType; scaleItem?: ScaleItem } {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const { participant } = findTournamentParticipant({
    tournamentRecord,
    participantId,
  });

  if (!participant) return { error: PARTICIPANT_NOT_FOUND };
  return participantScaleItem({ participant, scaleAttributes });
}

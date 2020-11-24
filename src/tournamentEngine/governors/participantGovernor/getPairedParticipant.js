import { intersection } from '../../../utilities/arrays';

import {
  INVALID_PARTICIPANT_IDS,
  MISSING_PARTICIPANT_IDS,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { PAIR } from '../../../constants/participantTypes';
import { SUCCESS } from '../../../constants/resultConstants';

export function getPairedParticipant({ tournamentRecord, participantIds }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantIds || participantIds.length < 2)
    return { error: MISSING_PARTICIPANT_IDS };
  if (participantIds.length > 2) return { error: INVALID_PARTICIPANT_IDS };

  const tournamentParticipants = tournamentRecord.participants || [];
  const existingPairedParticipant = tournamentParticipants.find(
    participant =>
      participant.participantType === PAIR &&
      intersection(participantIds, participant.individualParticipantIds)
        .length === 2
  );
  if (!existingPairedParticipant) return { error: PARTICIPANT_NOT_FOUND };

  return Object.assign({}, SUCCESS, { participant: existingPairedParticipant });
}

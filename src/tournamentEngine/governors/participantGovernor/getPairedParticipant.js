import { intersection } from '../../../utilities/arrays';
import { makeDeepCopy } from '../../../utilities';

import { SUCCESS } from '../../../constants/resultConstants';
import { PAIR } from '../../../constants/participantTypes';
import {
  INVALID_PARTICIPANT_IDS,
  MISSING_PARTICIPANT_IDS,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function getPairedParticipant({
  tournamentParticipants,
  tournamentRecord,
  participantIds,
}) {
  if (!tournamentParticipants && tournamentRecord)
    return { error: MISSING_TOURNAMENT_RECORD };
  if (!Array.isArray(participantIds) || participantIds.length > 2)
    return { error: INVALID_PARTICIPANT_IDS };
  if (!participantIds.length) return { error: MISSING_PARTICIPANT_IDS };

  tournamentParticipants =
    tournamentParticipants || tournamentRecord?.participants || [];
  const existingPairedParticipants = tournamentParticipants.filter(
    (participant) =>
      participant.participantType === PAIR &&
      intersection(participantIds, participant.individualParticipantIds)
        .length === participantIds.length
  );
  const existingPairedParticipant = existingPairedParticipants[0];
  if (!existingPairedParticipant) return { error: PARTICIPANT_NOT_FOUND };

  return {
    ...SUCCESS,
    participant: makeDeepCopy(existingPairedParticipant),
    duplicatedPairParticipants: makeDeepCopy(existingPairedParticipants),
  };
}

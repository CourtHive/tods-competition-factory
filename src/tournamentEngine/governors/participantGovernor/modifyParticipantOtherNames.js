import { findTournamentParticipant } from '../../getters/participants/participantGetter';
import { makeDeepCopy } from '../../../utilities';

import {
  INVALID_VALUES,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function modifyParticipantOtherNames({
  tournamentRecord,
  participantId,
  otherNames,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  if (!otherNames)
    return { error: MISSING_VALUE, message: 'Missing otherNames' };

  if (!Array.isArray(otherNames))
    return {
      error: INVALID_VALUES,
      message: 'otherNames must be an array of strings',
    };

  const { participant } = findTournamentParticipant({
    tournamentRecord,
    participantId,
  });
  if (!participant) return { error: PARTICIPANT_NOT_FOUND };

  participant.otherNames = otherNames;

  return Object.assign({}, SUCCESS, { participant: makeDeepCopy(participant) });
}

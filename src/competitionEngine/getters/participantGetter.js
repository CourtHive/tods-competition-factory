import { getTournamentParticipants } from '../../tournamentEngine/getters/participants/getTournamentParticipants';
import { findParticipant } from '../../common/deducers/findParticipant';
import { makeDeepCopy } from '../../utilities';

import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../constants/errorConditionConstants';

export function getCopmetitionParticipants(props) {
  const { tournamentRecords } = props || {};
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };
  const competitionParticipants = [];
  const competitionParticipantIds = [];

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { tournamentParticipants } = getTournamentParticipants({
      tournamentRecord,
      ...props,
    });
    for (const tournamentParticipant of tournamentParticipants) {
      const { participantId } = tournamentParticipant;
      if (!competitionParticipantIds.includes(participantId)) {
        competitionParticipantIds.push(participantId);
        competitionParticipants.push(tournamentParticipant);
      }
    }
  }

  return { competitionParticipants };
}

export function publicFindParticipant({
  tournamentRecords,
  participantId,
  personId,
  policyDefinition,
  inContext,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof participantId !== 'string' && typeof personId !== 'string')
    return { error: MISSING_VALUE };

  let participant;
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { tournamentParticipants } = getTournamentParticipants({
      tournamentRecord,
      policyDefinition,
      inContext,
    });
    participant = findParticipant({
      tournamentParticipants,
      participantId,
      personId,
      policyDefinition,
    });
    if (participant) break;
  }

  return { participant: makeDeepCopy(participant) };
}

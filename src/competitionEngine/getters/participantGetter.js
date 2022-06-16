import { getTournamentParticipants } from '../../tournamentEngine/getters/participants/getTournamentParticipants';
import { findParticipant } from '../../global/functions/deducers/findParticipant';
import { deepMerge } from '../../utilities/deepMerge';
import { makeDeepCopy } from '../../utilities';

import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../constants/errorConditionConstants';

export function getCompetitionParticipants(params) {
  const { tournamentRecords } = params || {};
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };
  let competitionParticipants = [];
  const competitionParticipantIds = [];
  const participantIdsWithConflicts = [];

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const {
      tournamentParticipants,
      participantIdsWithConflicts: idsWithConflicts,
    } = getTournamentParticipants({
      tournamentRecord,
      ...params,
    });
    for (const tournamentParticipant of tournamentParticipants) {
      const { participantId } = tournamentParticipant;
      if (!competitionParticipantIds.includes(participantId)) {
        competitionParticipantIds.push(participantId);
        competitionParticipants.push(tournamentParticipant);
      } else {
        // merge participant record context across tournaments
        competitionParticipants = competitionParticipants.map((participant) =>
          participant.participantId !== participantId
            ? participant
            : deepMerge(participant, tournamentParticipant, true)
        );
      }
    }

    idsWithConflicts &&
      idsWithConflicts.forEach((participantId) => {
        if (!participantIdsWithConflicts.includes(participantId))
          participantIdsWithConflicts.push(participantId);
      });
  }

  return { competitionParticipants, participantIdsWithConflicts };
}

export function publicFindParticipant({
  policyDefinitions,
  tournamentRecords,
  participantId,
  personId,
  inContext,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof participantId !== 'string' && typeof personId !== 'string')
    return { error: MISSING_VALUE };

  let participant, tournamentId;
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    tournamentId = tournamentRecord.tournamentId;

    const { tournamentParticipants } = getTournamentParticipants({
      policyDefinitions,
      tournamentRecord,
      inContext,
    });

    participant = findParticipant({
      tournamentParticipants,
      policyDefinitions,
      participantId,
      personId,
    });

    if (participant) break;
  }

  return { participant: makeDeepCopy(participant, false, true), tournamentId };
}

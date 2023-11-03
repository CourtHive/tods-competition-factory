import { getParticipants as participantGetter } from '../../tournamentEngine/getters/participants/getParticipants';
import { findParticipant } from '../../global/functions/deducers/findParticipant';
import { deepMerge } from '../../utilities/deepMerge';

import { MatchUp } from '../../types/tournamentFromSchema';
import { HydratedParticipant } from '../../types/hydrated';
import { SUCCESS } from '../../constants/resultConstants';
import {
  ErrorType,
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../constants/errorConditionConstants';
import {
  ContextProfile,
  ParticipantMap,
  PolicyDefinitions,
  TournamentRecordsArgs,
} from '../../types/factoryTypes';

export function getParticipants(params) {
  const { tournamentRecords } = params || {};
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  ) {
    return { error: MISSING_TOURNAMENT_RECORDS };
  }

  const participantMap: ParticipantMap = {};
  const participants: HydratedParticipant[] = [];
  const derivedEventInfo: any = {};
  const derivedDrawInfo: any = {};
  const matchUps: MatchUp[] = [];
  const mappedMatchUps = {};

  const participantIdsWithConflicts: string[] = [];
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const {
      participantIdsWithConflicts: idsWithConflicts,
      mappedMatchUps: tournamentMappedMatchUps,
      participantMap: tournamentParticipantMap,
      participants: tournamentParticipants,
      matchUps: tournamentMatchUps,
      derivedEventInfo: eventInfo,
      derivedDrawInfo: drawInfo,
    } = participantGetter({ tournamentRecord, ...params });

    Object.assign(mappedMatchUps, tournamentMappedMatchUps);
    Object.assign(participantMap, tournamentParticipantMap);
    Object.assign(derivedEventInfo, eventInfo);
    Object.assign(derivedDrawInfo, drawInfo);

    participants.push(...(tournamentParticipants ?? []));
    matchUps.push(...(tournamentMatchUps ?? []));

    idsWithConflicts?.forEach((participantId) => {
      if (!participantIdsWithConflicts.includes(participantId))
        participantIdsWithConflicts.push(participantId);
    });
  }
  return {
    participantIdsWithConflicts,
    derivedEventInfo,
    derivedDrawInfo,
    participantMap,
    mappedMatchUps,
    participants,
    ...SUCCESS,
    matchUps,
  };
}

export function getCompetitionParticipants(params) {
  const { tournamentRecords } = params || {};
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  let competitionParticipants: HydratedParticipant[] = [];
  const participantIdsWithConflicts: string[] = [];
  const competitionParticipantIds: string[] = [];
  const mappedMatchUps: { [key: string]: MatchUp } = {};

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const {
      participants,
      participantIdsWithConflicts: idsWithConflicts,
      mappedMatchUps: matchUpsMap,
    } = participantGetter({
      tournamentRecord,
      ...params,
    });
    if (matchUpsMap) Object.assign(mappedMatchUps, matchUpsMap);

    for (const tournamentParticipant of participants ?? []) {
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

    idsWithConflicts?.forEach((participantId) => {
      if (!participantIdsWithConflicts.includes(participantId))
        participantIdsWithConflicts.push(participantId);
    });
  }

  return {
    competitionParticipants,
    participantIdsWithConflicts,
    mappedMatchUps,
    ...SUCCESS,
  };
}

type PublicFindParticipantArgs = TournamentRecordsArgs & {
  policyDefinitions?: PolicyDefinitions;
  contextProfile?: ContextProfile;
  participantId?: string;
  personId?: string;
};
export function publicFindParticipant({
  tournamentRecords,
  policyDefinitions,
  contextProfile,
  participantId,
  personId,
}: PublicFindParticipantArgs): {
  participant?: HydratedParticipant;
  tournamentId?: string;
  error?: ErrorType;
  stack?: any;
} {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof participantId !== 'string' && typeof personId !== 'string')
    return { error: MISSING_VALUE, stack: 'publicFindParticipant' };

  let participant, tournamentId;
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    tournamentId = tournamentRecord.tournamentId;

    const participants =
      participantGetter({
        policyDefinitions,
        tournamentRecord,
      }).participants ?? [];

    participant = findParticipant({
      tournamentParticipants: participants,
      internalUse: true,
      policyDefinitions,
      contextProfile,
      participantId,
      personId,
    });

    if (participant) break;
  }

  return { participant, tournamentId, ...SUCCESS };
}

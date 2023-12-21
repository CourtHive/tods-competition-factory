import { getParticipants } from '../query/participants/getParticipants';
import { findParticipant } from './findParticipant';

import { ErrorType, MISSING_VALUE } from '../constants/errorConditionConstants';
import { HydratedParticipant } from '../types/hydrated';
import { SUCCESS } from '../constants/resultConstants';
import { Tournament } from '../types/tournamentTypes';
import {
  ContextProfile,
  PolicyDefinitions,
  TournamentRecords,
} from '../types/factoryTypes';

type PublicFindParticipantArgs = {
  tournamentRecords?: TournamentRecords;
  policyDefinitions?: PolicyDefinitions;
  tournamentRecord?: Tournament;
  contextProfile?: ContextProfile;
  participantId?: string;
  personId?: string;
};
export function publicFindParticipant(params: PublicFindParticipantArgs): {
  participant?: HydratedParticipant;
  tournamentId?: string;
  error?: ErrorType;
  stack?: any;
} {
  console.log('boo');
  const {
    tournamentRecord,
    policyDefinitions,
    contextProfile,
    participantId,
    personId,
  } = params;

  const tournamentRecords =
    params.tournamentRecords ||
    (tournamentRecord && {
      [tournamentRecord.tournamentId]: tournamentRecord,
    }) ||
    {};

  if (typeof participantId !== 'string' && typeof personId !== 'string')
    return { error: MISSING_VALUE, stack: 'publicFindParticipant' };

  let participant, tournamentId;
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    tournamentId = tournamentRecord.tournamentId;

    const participants =
      getParticipants({
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

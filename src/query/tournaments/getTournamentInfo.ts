import { getParticipants } from '@Query/participants/getParticipants';
import { makeDeepCopy } from '@Tools/makeDeepCopy';

// constants and types
import { ADMINISTRATION, MEDIA, MEDICAL, OFFICIAL, SECURITY } from '@Constants/participantRoles';
import { ErrorType, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';
import POLICY_PRIVACY_STAFF from '@Fixtures/policies/POLICY_PRIVACY_STAFF';
import { SUCCESS } from '@Constants/resultConstants';
import { Tournament } from '@Types/tournamentTypes';

export function getTournamentInfo(params?: { tournamentRecord: Tournament }): {
  tournamentInfo?: any;
  error?: ErrorType;
} {
  const { tournamentRecord } = params ?? {};
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const tournamentInfo: any = (({
    tournamentId,
    tournamentRank,
    tournamentStatus,

    formalName,
    tournamentName,
    promotionalName,
    onlineResources,

    localTimeZone,
    startDate,
    endDate,

    hostCountryCode,
    venues,
    notes,

    updatedAt,
  }) => ({
    tournamentId,
    tournamentRank,
    tournamentStatus,

    formalName,
    tournamentName,
    promotionalName,
    onlineResources,

    localTimeZone,
    startDate,
    endDate,

    hostCountryCode,
    venues,
    notes,

    updatedAt,
  }))(tournamentRecord);

  const tournamentContacts = getParticipants({
    participantFilters: { participantRoles: [ADMINISTRATION, OFFICIAL, MEDIA, MEDICAL, SECURITY] },
    policyDefinitions: POLICY_PRIVACY_STAFF,
    tournamentRecord,
  }).participants;

  if (tournamentContacts) tournamentInfo.tournamentContacts = tournamentContacts;

  return {
    ...SUCCESS,
    tournamentInfo: makeDeepCopy(tournamentInfo, false, true),
  };
}

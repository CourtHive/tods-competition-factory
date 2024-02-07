import { getParticipants } from '@Query/participants/getParticipants';
import { getPublishState } from '@Query/publishing/getPublishState';
import { extractEventInfo } from '@Query/event/extractEventInfo';
import { makeDeepCopy } from '@Tools/makeDeepCopy';

// constants and types
import { ADMINISTRATION, MEDIA, MEDICAL, OFFICIAL, SECURITY } from '@Constants/participantRoles';
import { ErrorType, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';
import POLICY_PRIVACY_STAFF from '@Fixtures/policies/POLICY_PRIVACY_STAFF';
import { SUCCESS } from '@Constants/resultConstants';
import { Tournament } from '@Types/tournamentTypes';

export function getTournamentInfo(params?: { tournamentRecord: Tournament; usePublishState?: boolean }): {
  tournamentInfo?: any;
  eventInfo?: any[];
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

  const publishState = getPublishState({ tournamentRecord })?.publishState;
  const publishedEventIds = publishState?.tournament?.status?.publishedEventIds || [];
  const eventInfo: any[] = [];

  for (const event of tournamentRecord.events ?? []) {
    if (publishedEventIds.includes(event.eventId)) {
      const info = extractEventInfo({ event }).eventInfo;
      if (info) eventInfo.push(info);
    }
  }

  tournamentInfo.eventInfo = eventInfo;

  return {
    tournamentInfo: makeDeepCopy(tournamentInfo, false, true),
    ...SUCCESS,
  };
}

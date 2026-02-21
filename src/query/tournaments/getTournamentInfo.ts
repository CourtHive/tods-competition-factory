import { allTournamentMatchUps } from '@Query/matchUps/getAllTournamentMatchUps';
import { getTimeItemValues } from '@Mutate/timeItems/getTimeItemValues';
import { getVenuesAndCourts } from '@Query/venues/venuesAndCourtsGetter';
import { getParticipants } from '@Query/participants/getParticipants';
import { getPublishState } from '@Query/publishing/getPublishState';
import { extractEventInfo } from '@Query/event/extractEventInfo';
import { definedAttributes } from '@Tools/definedAttributes';
import { makeDeepCopy } from '@Tools/makeDeepCopy';

// constants and types
import { ADMINISTRATION, MEDIA, MEDICAL, OFFICIAL, SECURITY } from '@Constants/participantRoles';
import { ErrorType, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';
import { completedMatchUpStatuses, BYE } from '@Constants/matchUpStatusConstants';
import { CONTAINER, ROUND_ROBIN } from '@Constants/drawDefinitionConstants';
import POLICY_PRIVACY_STAFF from '@Fixtures/policies/POLICY_PRIVACY_STAFF';
import { INDIVIDUAL } from '@Constants/participantConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { Tournament } from '@Types/tournamentTypes';

export function getTournamentInfo(params?: {
  tournamentRecord: Tournament;
  usePublishState?: boolean;
  withMatchUpStats?: boolean;
  withStructureDetails?: boolean;
  withVenueData?: boolean;
}): {
  tournamentInfo?: any;
  eventInfo?: any[];
  error?: ErrorType;
} {
  const { tournamentRecord, withMatchUpStats, withStructureDetails, withVenueData } = params ?? {};
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const extractTournamentInfo = ({
    tournamentId,
    tournamentRank,
    tournamentStatus,

    formalName,
    tournamentName,
    promotionalName,
    onlineResources,

    localTimeZone,
    activeDates,
    startDate,
    endDate,

    hostCountryCode,
    venues,
    notes,

    updatedAt,
  }: Tournament) => ({
    tournamentId,
    tournamentRank,
    tournamentStatus,

    formalName,
    tournamentName,
    promotionalName,
    onlineResources,

    localTimeZone,
    activeDates,
    startDate,
    endDate,

    hostCountryCode,
    venues,
    notes,

    updatedAt,
  });

  const tournamentInfo: any = extractTournamentInfo(tournamentRecord);

  const participantResult = getParticipants({
    participantFilters: { participantRoles: [ADMINISTRATION, OFFICIAL, MEDIA, MEDICAL, SECURITY] },
    policyDefinitions: POLICY_PRIVACY_STAFF,
    tournamentRecord,
  });

  const tournamentContacts = participantResult?.participants ?? [];
  if (tournamentContacts) tournamentInfo.tournamentContacts = tournamentContacts;

  const publishState = getPublishState({ tournamentRecord })?.publishState;
  const publishedEventIds = publishState?.tournament?.status?.publishedEventIds || [];
  const eventInfo: any[] = [];

  for (const event of tournamentRecord.events ?? []) {
    if (!params?.usePublishState || publishedEventIds.includes(event.eventId)) {
      const info = extractEventInfo({ event }).eventInfo;
      if (info) eventInfo.push(info);
    }
  }

  tournamentInfo.timeItemValues = getTimeItemValues({ element: tournamentRecord });

  tournamentInfo.publishState = publishState?.tournament;
  tournamentInfo.eventInfo = eventInfo;

  if (withMatchUpStats) {
    const participantCount = tournamentRecord.participants?.filter((p) => p.participantType === INDIVIDUAL).length ?? 0;
    const eventCount = tournamentRecord.events?.length ?? 0;

    const { matchUps = [] } = allTournamentMatchUps({ tournamentRecord });
    const nonByeMatchUps = matchUps.filter((m) => m.matchUpStatus !== BYE);
    const total = nonByeMatchUps.length;
    const completed = nonByeMatchUps.filter(
      (m) => completedMatchUpStatuses.includes(m.matchUpStatus) || m.winningSide,
    ).length;
    const scheduled = nonByeMatchUps.filter((m) => m.schedule?.scheduledDate || m.schedule?.scheduledTime).length;
    const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;

    tournamentInfo.participantCount = participantCount;
    tournamentInfo.eventCount = eventCount;
    tournamentInfo.matchUpStats = { total, completed, scheduled, percentComplete };
  }

  if (withStructureDetails) {
    const structures: any[] = [];
    for (const event of tournamentRecord.events ?? []) {
      for (const drawDefinition of event.drawDefinitions ?? []) {
        for (const structure of drawDefinition.structures ?? []) {
          if ([ROUND_ROBIN, CONTAINER].includes(structure?.structureType || '')) continue;
          structures.push(
            definedAttributes({
              eventId: event.eventId,
              eventName: event.eventName,
              eventType: event.eventType,
              drawId: drawDefinition.drawId,
              drawName: drawDefinition.drawName,
              drawType: drawDefinition.drawType,
              structureId: structure.structureId,
              structureName: structure.structureName,
              stage: structure.stage,
              stageSequence: structure.stageSequence,
              positionAssignments: structure.positionAssignments,
              seedAssignments: structure.seedAssignments,
              matchUpFormat: structure.matchUpFormat,
            }),
          );
        }
      }
    }
    tournamentInfo.structures = structures;
  }

  if (withVenueData) {
    const { venues } = getVenuesAndCourts({ tournamentRecord });
    tournamentInfo.venues = venues ?? [];
  }

  return {
    tournamentInfo: makeDeepCopy(definedAttributes(tournamentInfo), false, true),
    ...SUCCESS,
  };
}

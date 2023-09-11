import { getScheduleTiming } from '../../governors/scheduleGovernor/matchUpFormatTiming/getScheduleTiming';
import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { definedAttributes } from '../../../utilities/objects';
import { hydrateParticipants } from './hydrateParticipants';
import { getContextContent } from '../getContextContent';
import { getFlightProfile } from '../getFlightProfile';
import {
  getAllDrawMatchUps,
  getDrawMatchUps,
} from '../../../drawEngine/getters/getMatchUps/drawMatchUps';

import { ResultType } from '../../../global/functions/decorateResult';
import { HydratedMatchUp } from '../../../types/hydrated';
import {
  GetMatchUpsArgs,
  GroupsMatchUpsResult,
} from '../../../types/factoryTypes';
import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { MatchUp } from '../../../types/tournamentFromSchema';

export function allTournamentMatchUps(params?: GetMatchUpsArgs): ResultType & {
  matchUps?: HydratedMatchUp[];
} {
  if (!params?.tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  let { participantMap, participants } = params;
  const {
    scheduleVisibilityFilters,
    participantsProfile,
    afterRecoveryTimes,
    useParticipantMap, // will default to true in future release
    policyDefinitions,
    tournamentRecord,
    inContext = true,
    contextProfile,
    matchUpFilters,
    contextFilters,
    nextMatchUps,
    context,
  } = params;

  const tournamentId = params.tournamentId ?? tournamentRecord.tournamentId;
  const events = tournamentRecord?.events ?? [];

  if (!participants) {
    ({ participants, participantMap } = hydrateParticipants({
      participantsProfile,
      policyDefinitions,
      useParticipantMap,
      tournamentRecord,
      contextProfile,
      inContext,
    }));
  }

  const { appliedPolicies: tournamentAppliedPolicies } = getAppliedPolicies({
    tournamentRecord,
  });

  const additionalContext: { [key: string]: any } = {
    ...context,
    tournamentId,
    indoorOutDoor: tournamentRecord.indoorOutdoor,
    surfaceCategory: tournamentRecord.surfaceCategory,
    endDate: tournamentRecord.endDate,
  };

  const contextContent = getContextContent({
    policyDefinitions,
    tournamentRecord,
    contextProfile,
  });

  const matchUps = events
    .flatMap((event) => {
      additionalContext.eventDrawsCount = event.drawDefinitions?.length ?? 0;

      return (
        allEventMatchUps({
          context: additionalContext,
          scheduleVisibilityFilters,
          tournamentAppliedPolicies,
          participantsProfile,
          afterRecoveryTimes,
          policyDefinitions,
          tournamentRecord,
          contextContent,
          contextFilters,
          contextProfile,
          matchUpFilters,
          participantMap,
          nextMatchUps,
          participants,
          inContext,
          event,
        }).matchUps ?? []
      );
    })
    // TODO: these matchUps must be hydrated with participants
    // NOTE: matchUps on the tournamentRecord have no drawPositions; all data apart from participant context must be present
    .concat(...(tournamentRecord.matchUps ?? []));

  return { matchUps };
}

export function allDrawMatchUps(params: GetMatchUpsArgs) {
  let {
    participants: tournamentParticipants,
    participantMap,
    contextContent,
  } = params;

  const {
    scheduleVisibilityFilters,
    tournamentAppliedPolicies,
    participantsProfile,
    afterRecoveryTimes,
    policyDefinitions,
    useParticipantMap,
    tournamentRecord,
    contextFilters,
    contextProfile,
    drawDefinition,
    matchUpFilters,
    nextMatchUps,
    inContext,
    context,
    event,
  } = params;

  const { eventId, eventName, eventType, category, gender, matchUpFormat } =
    event ?? {};
  const additionalContext = {
    ...context,
    eventId,
    eventType,
    eventName,
    category,
    gender,
    matchUpFormat,
    indoorOutDoor: event?.indoorOutdoor ?? tournamentRecord?.indoorOutdoor,
    surfaceCategory:
      event?.surfaceCategory ?? tournamentRecord?.surfaceCategory,
    endDate: event?.endDate,
  };

  if (!tournamentParticipants?.length && !participantMap && tournamentRecord) {
    ({ participants: tournamentParticipants = [], participantMap } =
      hydrateParticipants({
        participantsProfile,
        useParticipantMap,
        policyDefinitions,
        tournamentRecord,
        contextProfile,
        inContext,
      }));
  }

  if (contextProfile && !contextContent) {
    contextContent = getContextContent({
      policyDefinitions,
      tournamentRecord,
      contextProfile,
      drawDefinition,
      event,
    });
  }

  return getAllDrawMatchUps({
    context: additionalContext,
    tournamentAppliedPolicies,
    scheduleVisibilityFilters,
    tournamentParticipants,
    participantsProfile,
    afterRecoveryTimes,
    policyDefinitions,
    tournamentRecord,
    drawDefinition,
    contextContent,
    contextFilters,
    contextProfile,
    matchUpFilters,
    participantMap,
    nextMatchUps,
    inContext,
    event,
  });
}

export function allEventMatchUps(params: GetMatchUpsArgs) {
  let { participants = [], contextContent, participantMap } = params;
  const {
    scheduleVisibilityFilters,
    tournamentAppliedPolicies,
    participantsProfile,
    afterRecoveryTimes,
    policyDefinitions,
    useParticipantMap,
    tournamentRecord,
    contextFilters,
    contextProfile,
    matchUpFilters,
    nextMatchUps,
    inContext,
    context,
    event,
  } = params;
  if (!event) return { error: MISSING_EVENT };
  const { eventId, eventName, endDate, category, gender, matchUpFormat } =
    event;

  const eventMatchUps: MatchUp[] = [];

  const additionalContext = {
    ...context,
    ...definedAttributes({
      indoorOutDoor: event.indoorOutdoor ?? tournamentRecord?.indoorOutdoor,
      surfaceCategory:
        event.surfaceCategory ?? tournamentRecord?.surfaceCategory,
      endDate: event.endDate ?? tournamentRecord?.endDate,
      tournamentId: tournamentRecord?.tournamentId,
      matchUpFormat,
      eventName,
      category,
      gender,
      eventId,
    }),
  };
  if (endDate) additionalContext.endDate = endDate;

  if (contextProfile && !contextContent) {
    contextContent = getContextContent({
      policyDefinitions,
      tournamentRecord,
      contextProfile,
      event,
    });
  }

  if (!participants?.length && !participantMap && tournamentRecord) {
    const hydratedParticipantResult = hydrateParticipants({
      participantsProfile,
      useParticipantMap,
      policyDefinitions,
      tournamentRecord,
      contextProfile,
      inContext,
    });
    participantMap = hydratedParticipantResult.participantMap;
    participants = hydratedParticipantResult.participants ?? [];
  }

  const drawDefinitions = event.drawDefinitions ?? [];
  const scheduleTiming = getScheduleTiming({
    tournamentRecord,
    event,
  }).scheduleTiming;

  const matchUps: HydratedMatchUp[] = drawDefinitions.flatMap(
    (drawDefinition) => {
      const { matchUps, matchUpsMap } = getAllDrawMatchUps({
        tournamentParticipants: participants,
        tournamentAppliedPolicies,
        scheduleVisibilityFilters,
        context: additionalContext,
        participantsProfile,
        afterRecoveryTimes,
        policyDefinitions,
        tournamentRecord,
        contextFilters,
        contextProfile,
        drawDefinition,
        contextContent,
        matchUpFilters,
        participantMap,
        scheduleTiming,
        nextMatchUps,
        inContext,
        event,
      });

      if (matchUpsMap?.drawMatchUps)
        eventMatchUps.push(...matchUpsMap.drawMatchUps);

      return matchUps ?? [];
    }
  );

  return { matchUps, eventMatchUps };
}

export function tournamentMatchUps(
  params: GetMatchUpsArgs
): GroupsMatchUpsResult {
  if (!params?.tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  let contextContent = params.contextContent;
  const {
    scheduleVisibilityFilters,
    participantsProfile,
    afterRecoveryTimes,
    policyDefinitions,
    useParticipantMap,
    tournamentRecord,
    inContext = true,
    contextFilters,
    contextProfile,
    matchUpFilters,
    nextMatchUps,
    context,
  } = params;
  const tournamentId = params.tournamentId ?? tournamentRecord.tournamentId;
  const events = tournamentRecord?.events ?? [];

  const { participants, participantMap } = hydrateParticipants({
    participantsProfile,
    policyDefinitions,
    useParticipantMap,
    tournamentRecord,
    contextProfile,
    inContext,
  });

  if (contextProfile && !contextContent)
    contextContent = getContextContent({
      policyDefinitions,
      tournamentRecord,
      contextProfile,
    });

  const { appliedPolicies: tournamentAppliedPolicies } = getAppliedPolicies({
    tournamentRecord,
  });
  const filteredEventIds = contextFilters?.eventIds ?? [];
  const eventsDrawsMatchUps = events
    .filter((event) => !filteredEventIds.includes(event.eventId))
    .map((event) => {
      const flightProfile = getFlightProfile({ event }).flightProfile;
      const additionalContext = {
        eventDrawsCount:
          flightProfile?.flights?.length || event.drawDefinitions?.length || 0,
        ...context,
      };

      return eventMatchUps({
        context: additionalContext,
        tournamentAppliedPolicies,
        scheduleVisibilityFilters,
        participantsProfile,
        afterRecoveryTimes,
        policyDefinitions,
        tournamentRecord,
        contextFilters,
        contextProfile,
        contextContent,
        matchUpFilters,
        participantMap,
        participants,
        tournamentId,
        nextMatchUps,
        inContext,
        event,
      });
    });

  return eventsDrawsMatchUps.reduce(
    (matchUps, eventMatchUps) => {
      const keys =
        eventMatchUps &&
        Object.keys(eventMatchUps).filter(
          (key) => !['success', 'matchUpsMap'].includes(key)
        );
      keys?.forEach((key) => {
        if (!matchUps[key]) matchUps[key] = [];
        matchUps[key] = matchUps[key].concat(eventMatchUps[key]);
        matchUps.matchUpsCount += eventMatchUps[key].length;
      });

      return matchUps;
    },
    { matchUpsCount: 0 }
  );
}

export function eventMatchUps(params: GetMatchUpsArgs): GroupsMatchUpsResult {
  let {
    participants: tournamentParticipants,
    contextContent,
    participantMap,
  } = params;

  const {
    tournamentAppliedPolicies,
    scheduleVisibilityFilters,
    participantsProfile,
    afterRecoveryTimes,
    policyDefinitions,
    useParticipantMap,
    tournamentRecord,
    contextFilters,
    contextProfile,
    matchUpFilters,
    nextMatchUps,
    tournamentId,
    inContext,
    context,
    event,
  } = params;

  if (!event) return { error: MISSING_EVENT };
  const { eventId, eventName, endDate } = event;

  const additionalContext = {
    ...context,
    ...definedAttributes({
      eventId,
      eventName,
      endDate: endDate ?? tournamentRecord?.endDate,
      tournamentId: tournamentId ?? tournamentRecord?.tournamentId,
      indoorOutDoor: event.indoorOutdoor ?? tournamentRecord?.indoorOutdoor,
      surfaceCategory:
        event.surfaceCategory ?? tournamentRecord?.surfaceCategory,
    }),
  };

  if (!tournamentParticipants && tournamentRecord) {
    ({ participants: tournamentParticipants, participantMap } =
      hydrateParticipants({
        participantsProfile,
        policyDefinitions,
        useParticipantMap,
        tournamentRecord,
        contextProfile,
        inContext,
      }));
  }

  if (contextProfile && !contextContent)
    contextContent = getContextContent({
      policyDefinitions,
      tournamentRecord,
      contextProfile,
      event,
    });

  const drawDefinitions = event.drawDefinitions ?? [];
  return drawDefinitions.reduce((matchUps, drawDefinition) => {
    const drawMatchUps = getDrawMatchUps({
      context: additionalContext,
      tournamentAppliedPolicies,
      scheduleVisibilityFilters,
      tournamentParticipants,
      participantsProfile,
      afterRecoveryTimes,
      policyDefinitions,
      tournamentRecord,
      drawDefinition,
      contextContent,
      contextFilters,
      contextProfile,
      matchUpFilters,
      participantMap,
      nextMatchUps,
      inContext,
      event,
    });

    const keys = Object.keys(drawMatchUps);
    keys?.forEach((key) => {
      if (!matchUps[key]) matchUps[key] = [];
      matchUps[key] = matchUps[key].concat(drawMatchUps[key]);
    });

    return matchUps;
  }, {});
}

export function drawMatchUps({
  participants: tournamentParticipants,
  tournamentAppliedPolicies,
  scheduleVisibilityFilters,
  participantsProfile,
  afterRecoveryTimes,
  policyDefinitions,
  useParticipantMap,
  tournamentRecord,
  contextFilters,
  contextProfile,
  contextContent,
  drawDefinition,
  matchUpFilters,
  participantMap,
  nextMatchUps,
  tournamentId,
  inContext,
  context,
  event,
}: GetMatchUpsArgs) {
  const { eventId, eventName, endDate } = event ?? {};

  const additionalContext = {
    ...context,
    ...definedAttributes({
      eventId,
      eventName,
      endDate: endDate ?? event?.endDate ?? tournamentRecord?.endDate,
      tournamentId: tournamentId ?? tournamentRecord?.tournamentId,
      indoorOutDoor: event?.indoorOutdoor ?? tournamentRecord?.indoorOutdoor,
      surfaceCategory:
        event?.surfaceCategory ?? tournamentRecord?.surfaceCategory,
    }),
  };

  if (!tournamentParticipants?.length && tournamentRecord) {
    ({ participants: tournamentParticipants, participantMap } =
      hydrateParticipants({
        participantsProfile,
        policyDefinitions,
        useParticipantMap,
        tournamentRecord,
        contextProfile,
        inContext,
      }));
  }

  if (event && contextProfile && !contextContent)
    contextContent = getContextContent({
      policyDefinitions,
      tournamentRecord,
      contextProfile,
      drawDefinition,
      event,
    });

  return getDrawMatchUps({
    context: additionalContext,
    tournamentAppliedPolicies,
    scheduleVisibilityFilters,
    tournamentParticipants,
    participantsProfile,
    afterRecoveryTimes,
    policyDefinitions,
    tournamentRecord,
    participantMap,
    drawDefinition,
    matchUpFilters,
    contextFilters,
    contextProfile,
    contextContent,
    nextMatchUps,
    inContext,
    event,
  });
}

import { getScheduleTiming } from '../../../query/extensions/matchUpFormatTiming/getScheduleTiming';
import { getEventPublishStatus } from '../../governors/publishingGovernor/getEventPublishStatus';
import { getAppliedPolicies } from '../../../query/extensions/getAppliedPolicies';
import { definedAttributes } from '../../../utilities/definedAttributes';
import { hydrateParticipants } from './hydrateParticipants';
import { getContextContent } from '../getContextContent';
import { getFlightProfile } from '../../../query/event/getFlightProfile';
import {
  getAllDrawMatchUps,
  getDrawMatchUps,
} from '../../../drawEngine/getters/getMatchUps/drawMatchUps';

import { ResultType } from '../../../global/functions/decorateResult';
import { SUCCESS } from '../../../constants/resultConstants';
import { HydratedMatchUp } from '../../../types/hydrated';
import {
  GetMatchUpsArgs,
  GroupsMatchUpsResult,
} from '../../../types/factoryTypes';
import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

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
      useParticipantMap,
      policyDefinitions,
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
    // TODO: tournamentRecord.matchUps must be hydrated with participants
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

  let groupInfo;
  if (!tournamentParticipants?.length && !participantMap && tournamentRecord) {
    ({
      participants: tournamentParticipants = [],
      participantMap,
      groupInfo,
    } = hydrateParticipants({
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

  const allDrawMatchUpsResult = getAllDrawMatchUps({
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

  return { ...allDrawMatchUpsResult, groupInfo };
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

  let groupInfo;
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
    groupInfo = hydratedParticipantResult.groupInfo;
  }

  const drawDefinitions = event.drawDefinitions ?? [];
  const scheduleTiming = getScheduleTiming({
    tournamentRecord,
    event,
  }).scheduleTiming;

  const matchUps: HydratedMatchUp[] = drawDefinitions.flatMap(
    (drawDefinition) => {
      const { matchUps } = getAllDrawMatchUps({
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

      return matchUps ?? [];
    }
  );

  return { matchUps, groupInfo };
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
    usePublishState,
    contextFilters,
    matchUpFilters,
    contextProfile,
    nextMatchUps,
    context,
  } = params;
  const tournamentId = params.tournamentId ?? tournamentRecord.tournamentId;
  const events = tournamentRecord?.events ?? [];

  const { participants, participantMap, groupInfo } = hydrateParticipants({
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
        usePublishState,
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

  const eventsDrawMatchUpsResult = eventsDrawsMatchUps.reduce(
    (matchUps, eventMatchUps) => {
      const keys =
        eventMatchUps &&
        Object.keys(eventMatchUps).filter(
          (key) => !['success', 'matchUpsMap'].includes(key)
        );
      keys?.forEach((key) => {
        if (Array.isArray(eventMatchUps[key])) {
          if (!matchUps[key]) matchUps[key] = [];
          matchUps[key] = matchUps[key].concat(eventMatchUps[key]);
          matchUps.matchUpsCount += eventMatchUps[key].length;
        }
      });

      return matchUps;
    },
    { matchUpsCount: 0 }
  );

  return { ...eventsDrawMatchUpsResult, groupInfo };
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
    usePublishState,
    contextFilters,
    matchUpFilters,
    contextProfile,
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

  let groupInfo: undefined | any;
  if (!tournamentParticipants && tournamentRecord) {
    ({
      participants: tournamentParticipants,
      participantMap,
      groupInfo,
    } = hydrateParticipants({
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

  const publishStatus = getEventPublishStatus({ event });
  const drawDefinitions = event.drawDefinitions ?? [];
  const eventResult = drawDefinitions.reduce((results, drawDefinition) => {
    const drawMatchUpsResult = getDrawMatchUps({
      context: additionalContext,
      tournamentAppliedPolicies,
      scheduleVisibilityFilters,
      tournamentParticipants,
      participantsProfile,
      afterRecoveryTimes,
      policyDefinitions,
      tournamentRecord,
      usePublishState,
      contextContent,
      contextFilters,
      matchUpFilters,
      participantMap,
      publishStatus,
      contextProfile,
      drawDefinition,
      nextMatchUps,
      inContext,
      event,
    });

    const keys = Object.keys(drawMatchUpsResult);
    keys?.forEach((key) => {
      if (Array.isArray(drawMatchUpsResult[key])) {
        if (!results[key]) results[key] = [];
        results[key] = results[key].concat(drawMatchUpsResult[key]);
      }
    });

    return results;
  }, {});

  return { ...eventResult, ...SUCCESS, groupInfo };
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
  usePublishState,
  contextFilters,
  contextContent,
  matchUpFilters,
  participantMap,
  publishStatus,
  contextProfile,
  drawDefinition,
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

  let groupInfo;
  if (!tournamentParticipants?.length && tournamentRecord) {
    ({
      participants: tournamentParticipants,
      participantMap,
      groupInfo,
    } = hydrateParticipants({
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

  const drawMatchUpsResult = getDrawMatchUps({
    context: additionalContext,
    tournamentAppliedPolicies,
    scheduleVisibilityFilters,
    tournamentParticipants,
    participantsProfile,
    afterRecoveryTimes,
    policyDefinitions,
    tournamentRecord,
    usePublishState,
    participantMap,
    contextContent,
    contextFilters,
    matchUpFilters,
    publishStatus,
    contextProfile,
    drawDefinition,
    nextMatchUps,
    inContext,
    event,
  });

  return { ...drawMatchUpsResult, groupInfo };
}

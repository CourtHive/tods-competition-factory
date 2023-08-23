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

import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function allTournamentMatchUps(params) {
  if (!params?.tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  let {
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
    participantMap,
    nextMatchUps,
    participants,
    context,
  } = params;

  const tournamentId =
    tournamentRecord.unifiedTournamentId?.tournamentId ||
    tournamentRecord.tournamentId;
  const events = tournamentRecord?.events || [];

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

  const additionalContext = {
    ...context,
    tournamentId,
    indoorOutDoor: tournamentRecord.indoorOutDoor,
    surfaceCategory: tournamentRecord.surfaceCategory,
    endDate: tournamentRecord.endDate,
  };

  const contextContent = getContextContent({
    policyDefinitions,
    tournamentRecord,
    contextProfile,
  });

  const matchUps = events
    .map((event) => {
      additionalContext.eventDrawsCount = event.drawDefinitions?.length || 0;

      return allEventMatchUps({
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
      }).matchUps;
    })
    .flat(Infinity)
    // TODO: these matchUps must be hydrated with participants
    // NOTE: matchUps on the tournamentRecord have no drawPositions; all data apart from participant context must be present
    .concat(...(tournamentRecord.matchUps || []));

  return { matchUps };
}

export function allDrawMatchUps(params) {
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
    event || {};
  const additionalContext = {
    ...context,
    eventId,
    eventType,
    eventName,
    category,
    gender,
    matchUpFormat,
    indoorOutDoor: event?.indoorOutDoor || tournamentRecord?.indoorOutDoor,
    surfaceCategory:
      event?.surfaceCategory || tournamentRecord?.surfaceCategory,
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

export function allEventMatchUps({
  scheduleVisibilityFilters,
  tournamentAppliedPolicies,
  participantsProfile,
  afterRecoveryTimes,
  policyDefinitions,
  participants = [],
  useParticipantMap,
  tournamentRecord,
  contextContent,
  contextFilters,
  contextProfile,
  matchUpFilters,
  participantMap,
  nextMatchUps,
  inContext,
  context,
  event,
}) {
  if (!event) return { error: MISSING_EVENT };
  const { eventId, eventName, endDate, category, gender, matchUpFormat } =
    event;

  const additionalContext = {
    ...context,
    ...definedAttributes({
      indoorOutDoor: event.indoorOutDoor || tournamentRecord?.indoorOutDoor,
      surfaceCategory:
        event.surfaceCategory || tournamentRecord?.surfaceCategory,
      endDate: event.endDate || tournamentRecord?.endDate,
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
    ({ participants, participantMap } = hydrateParticipants({
      participantsProfile,
      useParticipantMap,
      policyDefinitions,
      tournamentRecord,
      contextProfile,
      inContext,
    }));
  }

  const drawDefinitions = event.drawDefinitions || [];
  const scheduleTiming = getScheduleTiming({
    tournamentRecord,
    event,
  }).scheduleTiming;

  const matchUps = drawDefinitions
    .map((drawDefinition) => {
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
      return matchUps;
    })
    .flat(Infinity);

  return { matchUps };
}

export function tournamentMatchUps(params) {
  if (!params?.tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  let {
    scheduleVisibilityFilters,
    participantsProfile,
    afterRecoveryTimes,
    policyDefinitions,
    useParticipantMap,
    tournamentRecord,
    inContext = true,
    contextFilters,
    contextProfile,
    contextContent,
    matchUpFilters,
    nextMatchUps,
    context,
  } = params;
  const tournamentId =
    tournamentRecord.unifiedTournamentId?.tournamentId ||
    tournamentRecord.tournamentId;
  const events = tournamentRecord?.events || [];

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
  const filteredEventIds = contextFilters?.eventIds || [];
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

export function eventMatchUps({
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
  matchUpFilters,
  participantMap,
  nextMatchUps,
  tournamentId,
  inContext,
  context,
  event,
}) {
  if (!event) return { error: MISSING_EVENT };
  const { eventId, eventName, endDate } = event;

  const additionalContext = {
    ...context,
    ...definedAttributes({
      eventId,
      eventName,
      endDate: endDate || tournamentRecord?.endDate,
      tournamentId: tournamentId || tournamentRecord?.tournamentId,
      indoorOutDoor: event.indoorOutDoor || tournamentRecord?.indoorOutDoor,
      surfaceCategory:
        event.surfaceCategory || tournamentRecord?.surfaceCategory,
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

  const drawDefinitions = event.drawDefinitions || [];
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
}) {
  if (!event) return { error: MISSING_EVENT };
  const { eventId, eventName, endDate } = event || {};

  const additionalContext = {
    ...context,
    ...definedAttributes({
      eventId,
      eventName,
      endDate: endDate || event?.endDate || tournamentRecord?.endDate,
      tournamentId: tournamentId || tournamentRecord?.tournamentId,
      indoorOutDoor: event?.indoorOutDoor || tournamentRecord?.indoorOutDoor,
      surfaceCategory:
        event?.surfaceCategory || tournamentRecord?.surfaceCategory,
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

  if (contextProfile && !contextContent)
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

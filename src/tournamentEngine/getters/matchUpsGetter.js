import { addParticipantGroupings } from '../../drawEngine/governors/positionGovernor/avoidance/addParticipantGroupings';
import { findMatchUp as drawEngineFindMatchUp } from '../../drawEngine/getters/getMatchUps/findMatchUp';
import { getScheduleTiming } from '../governors/scheduleGovernor/matchUpFormatTiming/getScheduleTiming';
import { addNationalityCode } from '../governors/participantGovernor/addNationalityCode';
import { getAppliedPolicies } from '../../global/functions/deducers/getAppliedPolicies';
import { getParticipantMap } from './participants/getParticipantMap';
import { getScaleValues } from './participants/getScaleValues';
import { definedAttributes } from '../../utilities/objects';
import { makeDeepCopy } from '../../utilities/makeDeepCopy';
import { getContextContent } from './getContextContent';
import { getFlightProfile } from './getFlightProfile';
import { findEvent } from './eventGetter';
import {
  getAllDrawMatchUps,
  getDrawMatchUps,
} from '../../drawEngine/getters/getMatchUps/drawMatchUps';

import {
  MATCHUP_NOT_FOUND,
  MISSING_EVENT,
  MISSING_MATCHUP_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';

export function allTournamentMatchUps({
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
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const tournamentId =
    tournamentRecord.unifiedTournamentId?.tournamentId ||
    tournamentRecord.tournamentId;
  const events = tournamentRecord?.events || [];

  if (!participants) {
    ({ participants, participantMap } = getParticipants({
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
    .concat(...(tournamentRecord.matchUps || []));

  return { matchUps };
}

export function allDrawMatchUps({
  participants: tournamentParticipants,
  scheduleVisibilityFilters,
  tournamentAppliedPolicies,
  participantsProfile,
  afterRecoveryTimes,
  policyDefinitions,
  useParticipantMap,
  tournamentRecord,
  contextContent,
  contextFilters,
  contextProfile,
  drawDefinition,
  matchUpFilters,
  participantMap,
  nextMatchUps,
  inContext,
  context,
  event,
}) {
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
      getParticipants({
        participantsProfile,
        policyDefinitions,
        useParticipantMap,
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
    ({ participants, participantMap } = getParticipants({
      participantsProfile,
      policyDefinitions,
      useParticipantMap,
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

export function tournamentMatchUps({
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
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const tournamentId =
    tournamentRecord.unifiedTournamentId?.tournamentId ||
    tournamentRecord.tournamentId;
  const events = tournamentRecord?.events || [];

  const { participants, participantMap } = getParticipants({
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
    ({ participants: tournamentParticipants, participantMap } = getParticipants(
      {
        participantsProfile,
        policyDefinitions,
        useParticipantMap,
        tournamentRecord,
        contextProfile,
        inContext,
      }
    ));
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
    ({ participants: tournamentParticipants, participantMap } = getParticipants(
      {
        participantsProfile,
        policyDefinitions,
        useParticipantMap,
        tournamentRecord,
        contextProfile,
        inContext,
      }
    ));
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

function getParticipants({
  participantsProfile,
  policyDefinitions,
  useParticipantMap,
  tournamentRecord,
  contextProfile,
  inContext,
}) {
  if (useParticipantMap) {
    const participantMap = getParticipantMap({
      ...participantsProfile,
      ...contextProfile,
      policyDefinitions,
      tournamentRecord,
      inContext,
    })?.participantMap;

    return { participantMap };
  }

  let participants = tournamentRecord.participants || [];

  if (participantsProfile?.withIOC || participantsProfile?.withISO2)
    participants.forEach((participant) =>
      addNationalityCode({ participant, ...participantsProfile })
    );

  if (
    (inContext || participantsProfile?.withGroupings) &&
    participants?.length
  ) {
    participants = addParticipantGroupings({
      participantsProfile,
      participants,
    });
  }

  if (participantsProfile?.withScaleValues && participants?.length) {
    for (const participant of participants) {
      const { ratings, rankings } = getScaleValues({ participant });
      participant.rankings = rankings;
      participant.ratings = ratings;
    }
  }

  return { participants };
}

export function publicFindMatchUp(params) {
  Object.assign(params, { inContext: true });
  const { matchUp, error } = findMatchUp(params);
  return { matchUp: makeDeepCopy(matchUp, true, true), error };
}

export function findMatchUp({
  participantsProfile,
  afterRecoveryTimes,
  tournamentRecord,
  contextProfile,
  contextContent,
  nextMatchUps,
  matchUpId,
  inContext,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (typeof matchUpId !== 'string') return { error: MISSING_MATCHUP_ID };

  const { matchUps } = allTournamentMatchUps({ tournamentRecord });

  const inContextMatchUp = matchUps.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );
  if (!inContextMatchUp) return { error: MATCHUP_NOT_FOUND };

  // since drawEngineFindMatchUp is being used, additional context needs to be provided
  const { eventId, drawId } = inContextMatchUp;
  const { event, drawDefinition } = findEvent({
    tournamentRecord,
    eventId,
    drawId,
  });

  if (contextProfile && !contextContent)
    contextContent = getContextContent({ tournamentRecord, contextProfile });

  const additionalContext = {
    surfaceCategory: event.surfaceCategory || tournamentRecord.surfaceCategory,
    indoorOutDoor: event.indoorOutDoor || tournamentRecord.indoorOutDoor,
    endDate: event.endDate || tournamentRecord.endDate,
    tournamentId: tournamentRecord.tournamentId,
    eventId,
    drawId,
  };

  const tournamentParticipants = tournamentRecord.participants || [];
  const { matchUp, structure } = drawEngineFindMatchUp({
    context: inContext && additionalContext,
    tournamentParticipants,
    participantsProfile,
    afterRecoveryTimes,
    drawDefinition,
    contextProfile,
    contextContent,
    nextMatchUps,
    matchUpId,
    inContext,
    event,
  });
  return { matchUp, structure, drawDefinition };
}

import { findMatchUp as drawEngineFindMatchUp } from '../../drawEngine/getters/getMatchUps/findMatchUp';
import { getScheduleTiming } from '../governors/scheduleGovernor/matchUpFormatTiming/getScheduleTiming';
import { getTournamentParticipants } from './participants/getTournamentParticipants';
import { getAppliedPolicies } from '../governors/policyGovernor/getAppliedPolicies';
import { definedAttributes } from '../../utilities/objects';
import { makeDeepCopy } from '../../utilities/makeDeepCopy';
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
  policyDefinitions,
  tournamentRecord,
  inContext = true,
  contextProfile,
  matchUpFilters,
  contextFilters,
  nextMatchUps,
  context,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const tournamentId =
    tournamentRecord.unifiedTournamentId?.tournamentId ||
    tournamentRecord.tournamentId;
  const events = tournamentRecord?.events || [];
  const participants = getParticipants({ tournamentRecord });
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

  const matchUps = events
    .map(
      (event) =>
        allEventMatchUps({
          context: additionalContext,
          scheduleVisibilityFilters,
          tournamentAppliedPolicies,
          participantsProfile,
          policyDefinitions,
          tournamentRecord,
          matchUpFilters,
          contextFilters,
          contextProfile,
          nextMatchUps,
          participants,
          inContext,
          event,
        }).matchUps
    )
    .flat(Infinity)
    .concat(...(tournamentRecord.matchUps || []));
  return { matchUps };
}

export function allDrawMatchUps({
  scheduleVisibilityFilters,
  tournamentAppliedPolicies,
  participantsProfile,
  policyDefinitions,
  tournamentRecord,
  matchUpFilters,
  contextFilters,
  drawDefinition,
  contextProfile,
  participants,
  nextMatchUps,
  inContext,
  context,
  event,
}) {
  const { eventId, eventName, category, gender, matchUpFormat } = event || {};
  const additionalContext = {
    ...context,
    eventId,
    eventName,
    category,
    gender,
    matchUpFormat,
    indoorOutDoor: event?.indoorOutDoor || tournamentRecord?.indoorOutDoor,
    surfaceCategory:
      event?.surfaceCategory || tournamentRecord?.surfaceCategory,
    endDate: event?.endDate,
  };
  const tournamentParticipants =
    participants ||
    (tournamentRecord && getParticipants({ tournamentRecord })) ||
    [];

  return getAllDrawMatchUps({
    context: additionalContext,
    tournamentAppliedPolicies,
    scheduleVisibilityFilters,
    tournamentParticipants,
    participantsProfile,
    policyDefinitions,
    tournamentRecord,
    drawDefinition,
    matchUpFilters,
    contextFilters,
    contextProfile,
    nextMatchUps,
    inContext,
    event,
  });
}

export function allEventMatchUps({
  scheduleVisibilityFilters,
  tournamentAppliedPolicies,
  participantsProfile,
  policyDefinitions,
  participants = [],
  tournamentRecord,
  matchUpFilters,
  contextFilters,
  contextProfile,
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

  participants =
    participants || (tournamentRecord && getParticipants({ tournamentRecord }));
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
        policyDefinitions,
        tournamentRecord,
        drawDefinition,
        matchUpFilters,
        contextFilters,
        contextProfile,
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
  policyDefinitions,
  tournamentRecord,
  inContext = true,
  matchUpFilters,
  contextFilters,
  contextProfile,
  nextMatchUps,
  context,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const tournamentId =
    tournamentRecord.unifiedTournamentId?.tournamentId ||
    tournamentRecord.tournamentId;
  const events = (tournamentRecord && tournamentRecord.events) || [];
  const participants = getParticipants({
    participantsProfile,
    tournamentRecord,
  });
  const { appliedPolicies: tournamentAppliedPolicies } = getAppliedPolicies({
    tournamentRecord,
  });
  const filteredEventIds = (contextFilters && contextFilters.eventIds) || [];
  const eventsDrawsMatchUps = events
    .filter((event) => !filteredEventIds.includes(event.eventId))
    .map((event) =>
      eventMatchUps({
        tournamentAppliedPolicies,
        scheduleVisibilityFilters,
        participantsProfile,
        policyDefinitions,
        tournamentRecord,
        matchUpFilters,
        contextFilters,
        contextProfile,
        participants,
        tournamentId,
        nextMatchUps,
        inContext,
        context,
        event,
      })
    );

  const matchUpGroupings = eventsDrawsMatchUps.reduce(
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

  return matchUpGroupings;
}

export function eventMatchUps({
  tournamentAppliedPolicies,
  scheduleVisibilityFilters,
  participantsProfile,
  policyDefinitions,
  tournamentRecord,
  matchUpFilters,
  contextFilters,
  contextProfile,
  nextMatchUps,
  participants,
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

  const tournamentParticipants =
    participants ||
    (tournamentRecord &&
      getParticipants({ tournamentRecord, participantsProfile }));

  const drawDefinitions = event.drawDefinitions || [];
  const matchUpGroupings = drawDefinitions.reduce(
    (matchUps, drawDefinition) => {
      const drawMatchUps = getDrawMatchUps({
        context: additionalContext,
        tournamentAppliedPolicies,
        scheduleVisibilityFilters,
        tournamentParticipants,
        participantsProfile,
        policyDefinitions,
        tournamentRecord,
        drawDefinition,
        matchUpFilters,
        contextFilters,
        contextProfile,
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
    },
    {}
  );

  return matchUpGroupings;
}

export function drawMatchUps({
  tournamentAppliedPolicies,
  scheduleVisibilityFilters,
  participantsProfile,
  policyDefinitions,
  tournamentRecord,
  matchUpFilters,
  contextFilters,
  contextProfile,
  drawDefinition,
  nextMatchUps,
  participants,
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

  const tournamentParticipants =
    participants ||
    (tournamentRecord &&
      getParticipants({ tournamentRecord, participantsProfile }));

  return getDrawMatchUps({
    context: additionalContext,
    tournamentAppliedPolicies,
    scheduleVisibilityFilters,
    tournamentParticipants,
    participantsProfile,
    policyDefinitions,
    tournamentRecord,
    drawDefinition,
    matchUpFilters,
    contextFilters,
    contextProfile,
    nextMatchUps,
    inContext,
    event,
  });
}

function getParticipants({ tournamentRecord, participantsProfile }) {
  const { tournamentParticipants } = getTournamentParticipants({
    withEvents: false, // order is important
    withDraws: false, // order is important
    ...participantsProfile,
    tournamentRecord,
  });
  return tournamentParticipants;
}

export function publicFindMatchUp(params) {
  Object.assign(params, { inContext: true });
  const { matchUp, error } = findMatchUp(params);
  return { matchUp: makeDeepCopy(matchUp, true, true), error };
}

export function findMatchUp({
  participantsProfile,
  tournamentRecord,
  contextProfile,
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
    drawDefinition,
    contextProfile,
    nextMatchUps,
    matchUpId,
    inContext,
    event,
  });
  return { matchUp, structure, drawDefinition };
}

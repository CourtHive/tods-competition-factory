import { findMatchUp as drawEngineFindMatchUp } from '../../drawEngine/getters/getMatchUps/findMatchUp';
import { getScheduleTiming } from '../governors/scheduleGovernor/matchUpFormatTiming/getScheduleTiming';
import { getAppliedPolicies } from '../governors/policyGovernor/getAppliedPolicies';
import { makeDeepCopy } from '../../utilities/makeDeepCopy';
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
  tournamentRecord,

  inContext = true,
  nextMatchUps,
  matchUpFilters,
  contextFilters,
  policyDefinitions,
  scheduleVisibilityFilters,
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

  const context = { tournamentId, contextEndDate: tournamentRecord.endDate };

  const matchUps = events
    .map(
      (event) =>
        allEventMatchUps({
          event,
          context,
          inContext,
          nextMatchUps,
          participants,
          matchUpFilters,
          contextFilters,
          policyDefinitions,
          tournamentRecord,
          scheduleVisibilityFilters,
          tournamentAppliedPolicies,
        }).matchUps
    )
    .flat(Infinity);
  return { matchUps };
}

export function allDrawMatchUps({
  event,
  context,
  inContext,
  participants,
  nextMatchUps,
  matchUpFilters,
  contextFilters,
  drawDefinition,
  tournamentRecord,
  policyDefinitions,
  scheduleVisibilityFilters,
  tournamentAppliedPolicies,
}) {
  if (!event) return { error: MISSING_EVENT };
  const { eventId, eventName, category, gender, matchUpFormat } = event;
  const additionalContext = {
    ...context,
    eventId,
    eventName,
    category,
    gender,
    matchUpFormat,
  };
  const tournamentParticipants =
    participants ||
    (tournamentRecord && getParticipants({ tournamentRecord })) ||
    [];
  const { matchUps } = getAllDrawMatchUps({
    tournamentAppliedPolicies,
    scheduleVisibilityFilters,
    tournamentParticipants,
    context: additionalContext,
    tournamentRecord,
    policyDefinitions,
    drawDefinition,
    matchUpFilters,
    contextFilters,
    nextMatchUps,
    inContext,
    event,
  });

  return { matchUps };
}

export function allEventMatchUps({
  event,
  context,
  inContext,
  nextMatchUps,
  matchUpFilters,
  contextFilters,
  participants = [],
  tournamentRecord,
  policyDefinitions,
  scheduleVisibilityFilters,
  tournamentAppliedPolicies,
}) {
  if (!event) return { error: MISSING_EVENT };
  const { eventId, eventName, endDate, category, gender, matchUpFormat } =
    event;

  const additionalContext = {
    ...context,
    eventId,
    eventName,
    category,
    gender,
    matchUpFormat,
    tournamentId: tournamentRecord?.tournamentId,
  };
  if (endDate) additionalContext.contextEndDate = endDate;

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
        policyDefinitions,
        tournamentRecord,
        drawDefinition,
        matchUpFilters,
        contextFilters,
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
  tournamentRecord,
  matchUpFilters,
  contextFilters,
  inContext = true,
  nextMatchUps,
  policyDefinitions,
  scheduleVisibilityFilters,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const tournamentId =
    tournamentRecord.unifiedTournamentId?.tournamentId ||
    tournamentRecord.tournamentId;
  const events = (tournamentRecord && tournamentRecord.events) || [];
  const participants = getParticipants({ tournamentRecord });
  const { appliedPolicies: tournamentAppliedPolicies } = getAppliedPolicies({
    tournamentRecord,
  });
  const filteredEventIds = (contextFilters && contextFilters.eventIds) || [];
  const eventsDrawsMatchUps = events
    .filter((event) => !filteredEventIds.includes(event.eventId))
    .map((event) =>
      eventMatchUps({
        event,
        inContext,
        participants,
        tournamentId,
        matchUpFilters,
        contextFilters,
        nextMatchUps,
        policyDefinitions,
        tournamentAppliedPolicies,
        scheduleVisibilityFilters,
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
  event,
  inContext,
  nextMatchUps,
  participants,
  tournamentId,
  matchUpFilters,
  contextFilters,
  tournamentRecord,
  policyDefinitions,
  tournamentAppliedPolicies,
  scheduleVisibilityFilters,
}) {
  if (!event) return { error: MISSING_EVENT };
  const { eventId, eventName, endDate } = event;

  const context = { eventId, eventName };
  if (endDate) context.contextEndDate = endDate;
  if (tournamentId) context.tournamentId = tournamentId;

  const tournamentParticipants =
    participants || (tournamentRecord && getParticipants({ tournamentRecord }));

  const drawDefinitions = event.drawDefinitions || [];
  const matchUpGroupings = drawDefinitions.reduce(
    (matchUps, drawDefinition) => {
      const drawMatchUps = getDrawMatchUps({
        event,
        context,
        inContext,
        nextMatchUps,
        drawDefinition,
        matchUpFilters,
        contextFilters,
        tournamentRecord,
        policyDefinitions,
        tournamentAppliedPolicies,
        tournamentParticipants,
        scheduleVisibilityFilters,
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
  event,
  inContext,
  nextMatchUps,
  participants,
  tournamentId,
  matchUpFilters,
  contextFilters,
  drawDefinition,
  tournamentRecord,
  policyDefinitions,
  tournamentAppliedPolicies,
  scheduleVisibilityFilters,
}) {
  if (!event) return { error: MISSING_EVENT };
  const { eventId, eventName, endDate } = event;

  const context = { eventId, eventName };
  if (endDate) context.contextEndDate = endDate;
  if (tournamentId) context.tournamentId = tournamentId;

  const tournamentParticipants =
    participants || (tournamentRecord && getParticipants({ tournamentRecord }));
  return getDrawMatchUps({
    event,
    context,
    inContext,
    nextMatchUps,
    drawDefinition,
    matchUpFilters,
    contextFilters,
    tournamentRecord,
    policyDefinitions,
    tournamentAppliedPolicies,
    tournamentParticipants,
    scheduleVisibilityFilters,
  });
}

function getParticipants({ tournamentRecord }) {
  const participants =
    (tournamentRecord && tournamentRecord.participants) || [];
  return participants;
}

export function publicFindMatchUp(params) {
  Object.assign(params, { inContext: true });
  const { matchUp, error } = findMatchUp(params);
  return { matchUp: makeDeepCopy(matchUp, true, true), error };
}

export function findMatchUp({
  tournamentRecord,
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
  const context = {
    tournamentId: tournamentRecord.tournamentId,
    eventId,
    drawId,
  };

  const drawDefinitions = (tournamentRecord.events || [])
    .map((event) => event.drawDefinitions || [])
    .flat(Infinity);
  const drawDefinition = drawDefinitions.find(
    (drawDefinition) => drawDefinition.drawId === drawId
  );

  const tournamentParticipants = tournamentRecord.participants || [];
  const { matchUp, structure } = drawEngineFindMatchUp({
    context: inContext && context,
    tournamentParticipants,
    drawDefinition,
    nextMatchUps,
    matchUpId,
    inContext,
  });
  return { matchUp, structure, drawDefinition };
}

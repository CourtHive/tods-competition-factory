import {
  getAllDrawMatchUps,
  getDrawMatchUps,
} from '../../drawEngine/getters/getMatchUps/drawMatchUps';
import { makeDeepCopy } from '../../utilities/makeDeepCopy';
import { getAppliedPolicies } from '../governors/policyGovernor/getAppliedPolicies';
import { findMatchUp as drawEngineFindMatchUp } from '../../drawEngine/getters/getMatchUps/findMatchUp';

import {
  MATCHUP_NOT_FOUND,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';

export function allTournamentMatchUps({
  tournamentRecord,

  inContext = true,
  nextMatchUps,
  matchUpFilters,
  contextFilters,
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

  const context = { tournamentId };
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
  scheduleVisibilityFilters,
  tournamentAppliedPolicies,
}) {
  const { eventId, eventName, category, gender, matchUpFormat } = event;
  const additionalContext = Object.assign({}, context, {
    eventId,
    eventName,
    category,
    gender,
    matchUpFormat,
  });
  const tournamentParticipants =
    participants ||
    (tournamentRecord && getParticipants({ tournamentRecord })) ||
    [];
  const { matchUps } = getAllDrawMatchUps({
    drawDefinition,
    context: additionalContext,
    inContext,
    matchUpFilters,
    contextFilters,
    nextMatchUps,
    tournamentRecord,
    tournamentParticipants,
    tournamentAppliedPolicies,
    scheduleVisibilityFilters,
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
  scheduleVisibilityFilters,
  tournamentAppliedPolicies,
}) {
  const { eventId, eventName, category, gender, matchUpFormat } = event;
  const additionalContext = Object.assign({}, context, {
    eventId,
    eventName,
    category,
    gender,
    matchUpFormat,
  });
  participants =
    participants || (tournamentRecord && getParticipants({ tournamentRecord }));
  const drawDefinitions = event.drawDefinitions || [];
  const matchUps = drawDefinitions
    .map((drawDefinition) => {
      const { matchUps } = getAllDrawMatchUps({
        drawDefinition,
        context: additionalContext,
        inContext,
        matchUpFilters,
        contextFilters,
        nextMatchUps,
        tournamentRecord,
        tournamentAppliedPolicies,
        scheduleVisibilityFilters,
        tournamentParticipants: participants,
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
  scheduleVisibilityFilters,
}) {
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
        tournamentAppliedPolicies,
        scheduleVisibilityFilters,
      })
    );

  const matchUpGroupings = eventsDrawsMatchUps.reduce(
    (matchUps, eventMatchUps) => {
      const keys = Object.keys(eventMatchUps);
      keys.forEach((key) => {
        if (!matchUps[key]) matchUps[key] = [];
        matchUps[key] = matchUps[key].concat(eventMatchUps[key]);
      });

      return matchUps;
    },
    {}
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
  tournamentAppliedPolicies,
  scheduleVisibilityFilters,
}) {
  const { eventId, eventName } = event;
  const context = { eventId, eventName };
  if (tournamentId) Object.assign(context, { tournamentId });
  const tournamentParticipants =
    participants || (tournamentRecord && getParticipants({ tournamentRecord }));

  const drawDefinitions = event.drawDefinitions || [];
  const matchUpGroupings = drawDefinitions.reduce(
    (matchUps, drawDefinition) => {
      const drawMatchUps = getDrawMatchUps({
        context,
        inContext,
        nextMatchUps,
        drawDefinition,
        matchUpFilters,
        contextFilters,
        tournamentRecord,
        tournamentAppliedPolicies,
        tournamentParticipants,
        scheduleVisibilityFilters,
      });
      const keys = Object.keys(drawMatchUps);
      keys.forEach((key) => {
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
  tournamentAppliedPolicies,
  scheduleVisibilityFilters,
}) {
  const { eventId, eventName } = event;
  const context = { eventId, eventName };
  if (tournamentId) Object.assign(context, { tournamentId });
  const tournamentParticipants =
    participants || (tournamentRecord && getParticipants({ tournamentRecord }));
  return getDrawMatchUps({
    context,
    inContext,
    nextMatchUps,
    drawDefinition,
    matchUpFilters,
    contextFilters,
    tournamentRecord,
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

export function publicFindMatchUp(props) {
  Object.assign(props, { inContext: true });
  return { matchUp: makeDeepCopy(findMatchUp(props).matchUp) };
}

export function findMatchUp({
  tournamentRecord,
  drawDefinition,

  drawId,
  matchUpId,
  inContext,
  nextMatchUps,
}) {
  if (!drawId) {
    // if matchUp did not have context, find drawId by brute force
    const { matchUps } = allTournamentMatchUps({ tournamentRecord });
    drawId = matchUps.reduce((drawId, candidate) => {
      return candidate.matchUpId === matchUpId ? candidate.drawId : drawId;
    }, undefined);
    const drawDefinitions = (tournamentRecord.events || [])
      .map((event) => event.drawDefinitions || [])
      .flat(Infinity);
    drawDefinition = drawDefinitions.find(
      (drawDefinition) => drawDefinition.drawId === drawId
    );
  }

  // tournamentEngine middleware should have already found drawDefinition
  if (drawId) {
    const tournamentParticipants = tournamentRecord.participants || [];
    const { matchUp, structure } = drawEngineFindMatchUp({
      drawDefinition,
      matchUpId,
      nextMatchUps,
      tournamentParticipants,
      inContext,
    });
    return { matchUp, structure, drawDefinition };
  }

  return { error: MATCHUP_NOT_FOUND };
}

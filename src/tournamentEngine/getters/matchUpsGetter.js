import {
  findMatchUp as drawEngineFindMatchUp,
  getAllDrawMatchUps,
  getDrawMatchUps,
} from '../../drawEngine/getters/getMatchUps';
import { makeDeepCopy } from '../../utilities/makeDeepCopy';
import { getAppliedPolicies } from '../governors/policyGovernor/getAppliedPolicies';

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
  nextMatchUps,
  matchUpFilters,
  contextFilters,
  drawDefinition,
  participants = [],
  tournamentRecord,
  tournamentAppliedPolicies,
}) {
  const { eventId, eventName } = event;
  const additionalContext = Object.assign({}, context, { eventId, eventName });
  participants =
    participants || (tournamentRecord && getParticipants({ tournamentRecord }));
  const { matchUps } = getAllDrawMatchUps({
    drawDefinition,
    context: additionalContext,
    inContext,
    matchUpFilters,
    contextFilters,
    nextMatchUps,
    tournamentAppliedPolicies,
    tournamentParticipants: participants,
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
  tournamentAppliedPolicies,
}) {
  const { eventId, eventName } = event;
  const additionalContext = Object.assign({}, context, { eventId, eventName });
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
        tournamentAppliedPolicies,
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
        tournamentAppliedPolicies,
        tournamentParticipants,
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
    tournamentAppliedPolicies,
    tournamentParticipants,
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

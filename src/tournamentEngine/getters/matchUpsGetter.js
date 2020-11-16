import { makeDeepCopy } from '../../utilities/makeDeepCopy';
import { findMatchUp as drawEngineFindMatchUp } from '../../drawEngine/getters/getMatchUps';
import { getAppliedPolicies } from '../governors/policyGovernor/getAppliedPolicies';

export function allTournamentMatchUps({
  tournamentRecord,
  drawEngine,
  matchUpFilters,
  contextFilters,
}) {
  const tournamentId =
    tournamentRecord.unifiedTournamentId?.tournamentId ||
    tournamentRecord.tournamentId;
  const events = tournamentRecord?.events || [];
  const participants = getParticipants({ tournamentRecord });
  const { appliedPolicies: tournamentAppliedPolicies } = getAppliedPolicies({
    tournamentRecord,
  });
  const matchUps = events
    .map(
      event =>
        allEventMatchUps({
          event,
          drawEngine,
          participants,
          tournamentId,
          matchUpFilters,
          contextFilters,
          tournamentAppliedPolicies,
        }).matchUps
    )
    .flat(Infinity);
  return { matchUps };
}

export function allEventMatchUps({
  event,
  drawEngine,
  tournamentId,
  matchUpFilters,
  contextFilters,
  participants = [],
  tournamentAppliedPolicies,
}) {
  const { eventId, eventName } = event;
  const context = { eventId, eventName };
  if (tournamentId) Object.assign(context, { tournamentId });
  const drawDefinitions = event.drawDefinitions || [];
  const matchUps = drawDefinitions
    .map(drawDefinition => {
      const { matchUps } = drawEngine
        .setState(drawDefinition)
        .setParticipants(participants)
        .allDrawMatchUps({
          context,
          matchUpFilters,
          contextFilters,
          tournamentAppliedPolicies,
        });
      return matchUps;
    })
    .flat(Infinity);

  return { matchUps };
}

export function tournamentMatchUps({
  tournamentRecord,
  drawEngine,
  matchUpFilters,
  contextFilters,
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
    .filter(event => !filteredEventIds.includes(event.eventId))
    .map(
      event =>
        eventMatchUps({
          event,
          drawEngine,
          participants,
          tournamentId,
          matchUpFilters,
          contextFilters,
          tournamentAppliedPolicies,
        }).matchUps
    );

  const matchUpGroupings = eventsDrawsMatchUps.reduce(
    (matchUps, eventDraws) => {
      eventDraws.forEach(eventDraw => {
        const keys = Object.keys(eventDraw);
        keys.forEach(key => {
          if (!matchUps[key]) matchUps[key] = [];
          matchUps[key] = matchUps[key].concat(eventDraw[key]);
        });
      });

      return matchUps;
    },
    {}
  );

  return matchUpGroupings;
}

export function eventMatchUps({
  event,
  drawEngine,
  participants,
  tournamentId,
  matchUpFilters,
  contextFilters,
  tournamentAppliedPolicies,
}) {
  const { eventId, eventName } = event;
  const context = { eventId, eventName };
  if (tournamentId) Object.assign(context, { tournamentId });
  const drawDefinitions = event.drawDefinitions || [];
  const matchUps = drawDefinitions.map(drawDefinition => {
    const allDrawMatchUps = drawEngine
      .setState(drawDefinition)
      .setParticipants(participants)
      .drawMatchUps({
        context,
        matchUpFilters,
        contextFilters,
        tournamentAppliedPolicies,
      });
    return allDrawMatchUps;
  });

  return { matchUps };
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
  drawEngine,
  matchUpId,
  drawId,
  inContext,
}) {
  if (!drawId) {
    // if matchUp did not have context, find drawId by brute force
    const { matchUps } = allTournamentMatchUps({
      tournamentRecord,
      drawEngine,
    });
    drawId = matchUps.reduce((drawId, candidate) => {
      return candidate.matchUpId === matchUpId ? candidate.drawId : drawId;
    }, undefined);
  }

  // tournamentEngine middleware should have already found drawDefinition
  if (drawId) {
    const tournamentParticipants = tournamentRecord.participants || [];
    const { matchUp } = drawEngineFindMatchUp({
      drawDefinition,
      matchUpId,
      tournamentParticipants,
      inContext,
    });
    return { matchUp };
  }
}

import { makeDeepCopy } from '../../utilities/makeDeepCopy';
import { findMatchUp as drawEngineFindMatchUp } from '../../drawEngine/getters/getMatchUps';

export function allTournamentMatchUps({
  tournamentRecord,
  drawEngine,
  matchUpFilters,
  contextFilters,
}) {
  const { tournamentId } = tournamentRecord;
  const events = (tournamentRecord && tournamentRecord.Events) || [];
  const participants = getParticipants({ tournamentRecord });
  const matchUps = events
    .map(
      event =>
        allEventMatchUps({
          drawEngine,
          participants,
          tournamentId,
          event,
          matchUpFilters,
          contextFilters,
        }).matchUps
    )
    .flat(Infinity);
  return { matchUps };
}

export function allEventMatchUps({
  drawEngine,
  participants = [],
  tournamentId,
  event,
  matchUpFilters,
  contextFilters,
}) {
  const { eventId, eventName } = event;
  const context = { eventId, eventName };
  if (tournamentId) Object.assign(context, { tournamentId });
  const drawDefinitions = event.drawDefinitions || [];
  const matchUps = drawDefinitions.map(drawDefinition => {
    const { matchUps } = drawEngine
      .setState(drawDefinition)
      .setParticipants(participants)
      .allDrawMatchUps({ context, matchUpFilters, contextFilters });
    return matchUps;
  });

  return { matchUps };
}

export function tournamentMatchUps({
  tournamentRecord,
  drawEngine,
  matchUpFilters,
  contextFilters,
}) {
  const { tournamentId } = tournamentRecord;
  const events = (tournamentRecord && tournamentRecord.Events) || [];
  const participants = getParticipants({ tournamentRecord });
  const filteredEventIds = (contextFilters && contextFilters.eventIds) || [];
  const eventsDrawsMatchUps = events
    .filter(event => !filteredEventIds.includes(event.eventId))
    .map(
      event =>
        eventMatchUps({
          drawEngine,
          participants,
          tournamentId,
          event,
          matchUpFilters,
          contextFilters,
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
  drawEngine,
  participants,
  tournamentId,
  event,
  matchUpFilters,
  contextFilters,
}) {
  const { eventId, eventName } = event;
  const context = { eventId, eventName };
  if (tournamentId) Object.assign(context, { tournamentId });
  const drawDefinitions = event.drawDefinitions || [];
  const matchUps = drawDefinitions.map(drawDefinition => {
    const allDrawMatchUps = drawEngine
      .setState(drawDefinition)
      .setParticipants(participants)
      .drawMatchUps({ context, matchUpFilters, contextFilters });
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
  policies,
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
      policies,
      matchUpId,
      tournamentParticipants,
      inContext,
    });
    return { matchUp };
  }
}

export function matchUpActions({
  tournamentRecord,
  drawEngine,
  matchUpId,
  drawId,
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

  if (drawId) {
    const events = tournamentRecord.Events || [];
    const drawDefinitions = events
      .map(event => event.drawDefinitions || [])
      .flat();
    const drawDefinition = drawDefinitions.reduce(
      (drawDefinition, candidate) => {
        return candidate.drawId === drawId ? candidate : drawDefinition;
      },
      undefined
    );
    const actions = drawEngine
      .setState(drawDefinition)
      .matchUpActions({ matchUpId });
    return actions;
  }
}

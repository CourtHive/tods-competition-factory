import { SUCCESS } from '../../constants/resultConstants';

export function findEvent({ tournamentRecord, eventId, drawId }) {
  const events = (tournamentRecord && tournamentRecord.events) || [];
  if (eventId) {
    const event = events.reduce((event, candidate) => {
      return candidate.eventId === eventId ? candidate : event;
    }, undefined);
    return { event };
  } else if (drawId) {
    const { event, drawDefinition } = events.reduce((result, candidate) => {
      const drawDefinitions = (candidate && candidate.drawDefinitions) || [];
      const drawDefinition = drawDefinitions.reduce(
        (drawDefinition, candidate) => {
          return candidate.drawId === drawId ? candidate : drawDefinition;
        },
        undefined
      );
      return drawDefinition ? { event: candidate, drawDefinition } : result;
    }, {});

    return { event, drawDefinition };
  }
  return {};
}

export function getDrawDefinition({ tournamentRecord, drawId }) {
  if (!drawId) {
    return { error: 'Missing drawId' };
  }

  const target = (tournamentRecord.events || []).reduce((target, event) => {
    const candidate = (event.drawDefinitions || []).reduce(
      (drawDefinition, candidate) => {
        return candidate.drawId === drawId ? candidate : drawDefinition;
      },
      undefined
    );
    return candidate && candidate.drawId === drawId
      ? { event, drawDefinition: candidate }
      : target;
  }, undefined);

  return target
    ? { ...target, SUCCESS }
    : { error: 'drawDefinition not found' };
}

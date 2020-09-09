import { SUCCESS } from '../../../constants/resultConstants';
import { findEvent } from '../../getters/eventGetter';

export function setMatchUpStatus(props) {
  const { drawEngine, drawDefinition, event, drawId, matchUpId, matchUpTieId, matchUpFormat, outcome } = props;
  let errors = [];

  if (matchUpFormat) {
    drawEngine
      .setState(drawDefinition)
      .setMatchUpFormat({ matchUpFormat, matchUpId });
  }

  const { errors: setMatchUpStatusErrors } = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpTieId,
    matchUpStatus: outcome.matchUpStatus,
    winningSide: outcome.winningSide,
    score: outcome.score || '',
    sets: outcome.sets
  });
  if (setMatchUpStatusErrors) errors = errors.concat(setMatchUpStatusErrors);

  if (event) {
    event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
      return drawDefinition.drawId === drawId ? drawEngine.getState() : drawDefinition;   
    });
  } else {
    errors.push({ error: 'event not found' });
  }

  return (errors && errors.length) ? { errors } : SUCCESS;
}

export function bulkMatchUpStatusUpdate(props) {
  const { tournamentRecord, drawEngine, outcomes } = props;
  let errors = [];
  let modified = 0;
  const events = {};
  outcomes.forEach((outcome) => {
    const { eventId } = outcome;
    if (!events[eventId]) events[eventId] = [];
    events[eventId].push(outcome);
  });

  Object.keys(events).forEach((eventId) => {
    const { event } = findEvent({ tournamentRecord, eventId });
    events[eventId].forEach((outcome) => {
      const { drawId } = outcome;
      const drawDefinition = event.drawDefinitions.find((drawDefinition) => drawDefinition.drawId === drawId);
      if (drawDefinition) {
        const { matchUpFormat, matchUpId } = outcome;
        const result = setMatchUpStatus({
          drawEngine,
          drawDefinition,
          event,
          drawId,
          matchUpFormat,
          matchUpId,
          outcome
        });
        if (result.errors) {
          errors = errors.concat(...result.errors);
        } else {
          modified++;
        }
      }
    });
  });

  return modified && SUCCESS;
}

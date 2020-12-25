import { findEvent } from '../../getters/eventGetter';

import { EVENT_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { matchUpScore } from '../../../drawEngine/governors/matchUpGovernor/matchUpScore';

export function setMatchUpStatus(props) {
  let { outcome } = props;
  const {
    deepCopy,
    drawEngine,
    drawDefinition,
    event,
    drawId,
    matchUpId,
    matchUpTieId,
    matchUpFormat,
  } = props;
  let errors = [];

  drawEngine.setState(drawDefinition, deepCopy);

  if (matchUpFormat) {
    const result = drawEngine.setMatchUpFormat({ matchUpFormat, matchUpId });
    if (result.error) return { errors: [{ error: result.error }] };
  }

  if (outcome?.score?.sets && !outcome.score.scoreStringSide1) {
    outcome.score = matchUpScore(outcome);
  }

  const { error: setMatchUpStatusError } = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpTieId,
    matchUpStatus: outcome?.matchUpStatus,
    matchUpStatusCodes: outcome?.matchUpStatusCodes,
    winningSide: outcome?.winningSide,
    score: outcome?.score,
  });
  if (setMatchUpStatusError?.errors)
    errors = errors.concat(setMatchUpStatusError.errors);

  if (event) {
    const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();
    event.drawDefinitions = event.drawDefinitions.map((drawDefinition) => {
      return drawDefinition.drawId === drawId
        ? updatedDrawDefinition
        : drawDefinition;
    });
  } else {
    errors.push({ error: EVENT_NOT_FOUND });
  }

  return errors && errors.length ? { errors } : SUCCESS;
}

export function bulkMatchUpStatusUpdate(props) {
  const { tournamentRecord, drawEngine, outcomes, devContext } = props;
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
      const drawDefinition = event.drawDefinitions.find(
        (drawDefinition) => drawDefinition.drawId === drawId
      );
      if (drawDefinition) {
        const { matchUpFormat, matchUpId } = outcome;
        const result = setMatchUpStatus({
          drawEngine,
          drawDefinition,
          event,
          drawId,
          matchUpFormat,
          matchUpId,
          outcome,
        });
        if (result.errors) {
          errors = errors.concat(...result.errors);
          if (devContext) console.log('error:', result);
        } else {
          modified++;
        }
      }
    });
  });

  return (modified && SUCCESS) || (errors.length && { error: errors });
}

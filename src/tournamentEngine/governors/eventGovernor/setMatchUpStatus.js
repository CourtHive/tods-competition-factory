import { getDevContext } from '../../../global/globalState';
import { findEvent } from '../../getters/eventGetter';
import { makeDeepCopy } from '../../../utilities';

import { matchUpScore } from '../../../drawEngine/governors/matchUpGovernor/matchUpScore';
import { setMatchUpFormat } from '../../../drawEngine/governors/matchUpGovernor/matchUpFormat';
import { setMatchUpStatus as drawEngineSetMatchUpStatus } from '../../../drawEngine/governors/matchUpGovernor/setMatchUpStatus';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_DRAW_ID,
  MISSING_MATCHUP_ID,
} from '../../../constants/errorConditionConstants';

/**
 *
 * Sets either matchUpStatus or score and winningSide; values to be set are passed in outcome object.
 *
 * @param {string} drawId - id of draw within which matchUp is found
 * @param {string} matchUpId - id of matchUp to be modified
 * @param {string} matchUpTieId - id of matchUpTie, if relevant
 * @param {string} matchUpFormat - optional - matchUpFormat if different from draw/event default
 * @param {object} outcome - { score, winningSide, matchUpStatus }
 *
 */
export function setMatchUpStatus(props) {
  const {
    drawDefinition,
    matchUpId,
    matchUpTieId,
    matchUpFormat,
    schedule,
    tournamentRecord,
    notes,
  } = props;
  if (!drawDefinition) return { error: MISSING_DRAW_ID };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  let { outcome } = props;

  if (matchUpFormat) {
    const result = setMatchUpFormat({
      drawDefinition,
      matchUpFormat,
      matchUpId,
    });
    if (result.error) return result;
  }

  if (outcome?.score?.sets && !outcome.score.scoreStringSide1) {
    const { score: scoreObject } = matchUpScore(outcome);
    outcome.score = scoreObject;
    outcome.score.sets = outcome.score.sets.filter(
      (set) =>
        set.side1Score ||
        set.side2Score ||
        set.side1TiebreakScore ||
        set.side2TiebreakScore
    );
  }

  const { error: setMatchUpStatusError, matchUp } = drawEngineSetMatchUpStatus({
    tournamentRecord,
    drawDefinition,
    matchUpId,
    matchUpTieId,
    matchUpFormat,
    matchUpStatus: outcome?.matchUpStatus,
    matchUpStatusCodes: outcome?.matchUpStatusCodes,
    winningSide: outcome?.winningSide,
    score: outcome?.score,
    schedule,
    notes,
  });
  if (setMatchUpStatusError) {
    return { error: setMatchUpStatusError };
  }

  return matchUp && getDevContext()
    ? Object.assign({}, SUCCESS, { matchUp: makeDeepCopy(matchUp) })
    : SUCCESS;
}

export function bulkMatchUpStatusUpdate(props) {
  const { tournamentRecord, outcomes } = props;
  const events = {};

  // group outcomes by events to optimize
  outcomes.forEach((outcome) => {
    const { eventId } = outcome;
    if (!events[eventId]) events[eventId] = [];
    events[eventId].push(outcome);
  });

  for (const eventId of Object.keys(events)) {
    const { event } = findEvent({ tournamentRecord, eventId });

    for (const outcome of events[eventId]) {
      const { drawId } = outcome;
      const drawDefinition = event.drawDefinitions.find(
        (drawDefinition) => drawDefinition.drawId === drawId
      );
      if (drawDefinition) {
        const { matchUpFormat, matchUpId } = outcome;
        const result = setMatchUpStatus({
          tournamentRecord,
          drawDefinition,
          event,
          drawId,
          matchUpFormat,
          matchUpId,
          schedule: outcome?.schedule,
          outcome,
        });
        if (result.error) {
          return result;
        }
      }
    }
  }

  return SUCCESS;
}

import { setMatchUpStatus as drawEngineSetMatchUpStatus } from '../../../drawEngine/governors/matchUpGovernor/setMatchUpStatus';
import { setMatchUpFormat } from '../../../drawEngine/governors/matchUpGovernor/setMatchUpFormat';
import { matchUpScore } from '../../../matchUpEngine/generators/matchUpScore';
import { findPolicy } from '../policyGovernor/findPolicy';
import { findEvent } from '../../getters/eventGetter';

import { POLICY_TYPE_SCORING } from '../../../constants/policyConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_DRAW_ID,
  MISSING_MATCHUP_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Event,
  Tournament,
} from '../../../types/tournamentFromSchema';

/**
 * Sets either matchUpStatus or score and winningSide; values to be set are passed in outcome object.
 */

type SetMatchUpStatusArgs = {
  tournamentRecords?: { [key: string]: Tournament };
  allowChangePropagation?: boolean;
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  disableAutoCalc?: boolean;
  enableAutoCalc?: boolean;
  matchUpFormat?: string;
  policyDefinitions: any;
  matchUpId: string;
  drawId?: string;
  schedule?: any;
  notes?: string;
  event?: Event;
  outcome?: any;
};
export function setMatchUpStatus(params: SetMatchUpStatusArgs) {
  const {
    tournamentRecords,
    policyDefinitions,
    tournamentRecord,
    disableAutoCalc,
    enableAutoCalc,
    drawDefinition,
    matchUpFormat,
    matchUpId,
    schedule,
    event,
    notes,
  } = params;

  if (!drawDefinition) return { error: MISSING_DRAW_ID };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  const { policy } = findPolicy({
    policyType: POLICY_TYPE_SCORING,
    tournamentRecord,
    event,
  });

  // whether or not to allow winningSide change propagation
  const allowChangePropagation =
    (params.allowChangePropagation !== undefined &&
      params.allowChangePropagation) ||
    (policy?.allowChangePropagation !== undefined &&
      policy.allowChangePropagation) ||
    undefined;

  const { outcome } = params;

  if (matchUpFormat) {
    const result = setMatchUpFormat({
      tournamentRecord,
      drawDefinition,
      matchUpFormat,
      matchUpId,
      event,
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

  return drawEngineSetMatchUpStatus({
    matchUpStatusCodes: outcome?.matchUpStatusCodes,
    matchUpStatus: outcome?.matchUpStatus,
    winningSide: outcome?.winningSide,
    allowChangePropagation,
    score: outcome?.score,
    tournamentRecords,
    policyDefinitions,
    tournamentRecord,
    disableAutoCalc,
    enableAutoCalc,
    drawDefinition,
    matchUpFormat,
    matchUpId,
    schedule,
    event,
    notes,
  });
}

export function bulkMatchUpStatusUpdate(params) {
  if (!params.tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const { tournamentRecords, tournamentRecord, outcomes, policyDefinitions } =
    params;
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
      const drawDefinition = event?.drawDefinitions?.find(
        (drawDefinition) => drawDefinition.drawId === drawId
      );
      if (drawDefinition && drawId) {
        const { matchUpFormat, matchUpId } = outcome;
        const result = setMatchUpStatus({
          schedule: outcome?.schedule,
          tournamentRecords,
          policyDefinitions,
          tournamentRecord,
          drawDefinition,
          matchUpFormat,
          matchUpId,
          outcome,
          drawId,
          event,
        });
        if (result.error) {
          return result;
        }
      }
    }
  }

  return { ...SUCCESS };
}

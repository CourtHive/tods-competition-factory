import { setMatchUpStatus as drawEngineSetMatchUpStatus } from '../../../mutate/matchUps/matchUpStatus/setMatchUpStatus';
import { setMatchUpFormat } from '../../../mutate/matchUps/matchUpFormat/setMatchUpFormat';
import { matchUpScore } from '../../../matchUpEngine/generators/matchUpScore';
import { findPolicy } from '../../../acquire/findPolicy';

import { POLICY_TYPE_SCORING } from '../../../constants/policyConstants';
import { PolicyDefinitions } from '../../../types/factoryTypes';
import {
  MISSING_DRAW_ID,
  MISSING_MATCHUP_ID,
} from '../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Event,
  Tournament,
} from '../../../types/tournamentTypes';

/**
 * Sets either matchUpStatus or score and winningSide; values to be set are passed in outcome object.
 */

type SetMatchUpStatusArgs = {
  tournamentRecords?: { [key: string]: Tournament };
  policyDefinitions?: PolicyDefinitions;
  allowChangePropagation?: boolean;
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  disableAutoCalc?: boolean;
  enableAutoCalc?: boolean;
  matchUpFormat?: string;
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

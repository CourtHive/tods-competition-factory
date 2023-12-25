import { resolveTournamentRecords } from '../../../parameters/resolveTournamentRecords';
import { matchUpScore } from '../../../assemblies/generators/matchUps/matchUpScore';
import { setMatchUpMatchUpFormat } from '../matchUpFormat/setMatchUpMatchUpFormat';
import { findPolicy } from '../../../acquire/findPolicy';
import { findEvent } from '../../../acquire/findEvent';
import { setMatchUpState } from './setMatchUpState';

import {
  DrawDefinition,
  Event,
  Tournament,
} from '../../../types/tournamentTypes';
import { POLICY_TYPE_SCORING } from '../../../constants/policyConstants';
import { PolicyDefinitions } from '../../../types/factoryTypes';
import {
  MISSING_DRAW_ID,
  MISSING_MATCHUP_ID,
} from '../../../constants/errorConditionConstants';

/**
 * Sets either matchUpStatus or score and winningSide; values to be set are passed in outcome object.
 * Public API for setting matchUpStatus or score and winningSide.
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
  tournamentId?: string;
  matchUpId: string;
  eventId?: string;
  drawId?: string;
  schedule?: any;
  notes?: string;
  event?: Event;
  outcome?: any;
};
export function setMatchUpStatus(params: SetMatchUpStatusArgs) {
  const tournamentRecords = resolveTournamentRecords(params);
  if (!params.drawDefinition) {
    const tournamentRecord =
      params.tournamentRecord ??
      (params.tournamentId && tournamentRecords[params.tournamentId]);
    if (!params.tournamentRecord) params.tournamentRecord = tournamentRecord;

    const result = findEvent({
      eventId: params.eventId,
      drawId: params.drawId,
      tournamentRecord,
    });
    if (result.error) return result;
    if (result.drawDefinition) params.drawDefinition = result.drawDefinition;
    params.event = result.event;
  }

  const {
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
    const result = setMatchUpMatchUpFormat({
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

  return setMatchUpState({
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

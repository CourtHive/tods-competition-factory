import { setMatchUpMatchUpFormat } from '@Mutate/matchUps/matchUpFormat/setMatchUpMatchUpFormat';
import { resolveTournamentRecords } from '@Helpers/parameters/resolveTournamentRecords';
import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { setMatchUpState } from '@Mutate/matchUps/matchUpStatus/setMatchUpState';
import { matchUpScore } from '@Assemblies/generators/matchUps/matchUpScore';
import { decorateResult } from '@Functions/global/decorateResult';
import { pushGlobalLog } from '@Functions/global/globalLog';
import { findPolicy } from '@Acquire/findPolicy';
import { findEvent } from '@Acquire/findEvent';

// constants and types
import { DRAW_DEFINITION, MATCHUP_ID } from '@Constants/attributeConstants';
import { INVALID_WINNING_SIDE } from '@Constants/errorConditionConstants';
import { DrawDefinition, Event, Tournament } from '@Types/tournamentTypes';
import { POLICY_TYPE_SCORING } from '@Constants/policyConstants';
import { PolicyDefinitions } from '@Types/factoryTypes';
import { progressExitStatus } from '../drawPositions/progressExitStatus';

/**
 * Sets either matchUpStatus or score and winningSide; values to be set are passed in outcome object.
 * Public API for setting matchUpStatus or score and winningSide.
 */

type SetMatchUpStatusArgs = {
  tournamentRecords?: { [key: string]: Tournament };
  policyDefinitions?: PolicyDefinitions;
  disableScoreValidation?: boolean;
  allowChangePropagation?: boolean;
  drawDefinition: DrawDefinition;
  propagateExitStatus?: boolean;
  tournamentRecord: Tournament;
  disableAutoCalc?: boolean;
  enableAutoCalc?: boolean;
  matchUpFormat?: string;
  tournamentId?: string;
  setTBlast?: boolean; // when true, the tiebreak score always appears last in set score string; when false, the tiebreak score is listed in parentheses after the losing set score
  matchUpId: string;
  eventId?: string;
  drawId?: string;
  schedule?: any;
  notes?: string;
  event?: Event;
  outcome?: any;
};
export function setMatchUpStatus(params: SetMatchUpStatusArgs) {
  const paramsCheck = checkRequiredParameters(params, [{ [MATCHUP_ID]: true, [DRAW_DEFINITION]: true }]);
  if (paramsCheck.error) return paramsCheck;
  const stack = 'setMatchUpStatus';

  const tournamentRecords = resolveTournamentRecords(params);
  if (!params.drawDefinition) {
    const tournamentRecord = params.tournamentRecord ?? (params.tournamentId && tournamentRecords[params.tournamentId]);
    if (!params.tournamentRecord) params.tournamentRecord = tournamentRecord;

    const result = findEvent({
      eventId: params.eventId,
      drawId: params.drawId,
      tournamentRecord,
    });
    if (result.error) return decorateResult({ stack, result });
    if (result.drawDefinition) params.drawDefinition = result.drawDefinition;
    params.event = result.event;
  }

  const {
    disableScoreValidation,
    propagateExitStatus,
    policyDefinitions,
    tournamentRecord,
    disableAutoCalc,
    enableAutoCalc,
    drawDefinition,
    matchUpId,
    schedule,
    event,
    notes,
  } = params;

  pushGlobalLog({
    color: 'brightyellow',
    method: stack,
    matchUpId,
  });

  const matchUpFormat = params.matchUpFormat || params.outcome?.matchUpFormat;

  const { policy } = findPolicy({
    policyType: POLICY_TYPE_SCORING,
    tournamentRecord,
    event,
  });

  // whether or not to allow winningSide change propagation
  const allowChangePropagation =
    (params.allowChangePropagation !== undefined && params.allowChangePropagation) ||
    (policy?.allowChangePropagation !== undefined && policy.allowChangePropagation) ||
    undefined;

  const { outcome, setTBlast } = params;

  if (outcome?.winningSide && ![1, 2].includes(outcome.winningSide)) {
    return decorateResult({ result: { error: INVALID_WINNING_SIDE }, stack });
  }

  if (matchUpFormat) {
    const result = setMatchUpMatchUpFormat({
      tournamentRecord,
      drawDefinition,
      matchUpFormat,
      matchUpId,
      event,
    });
    if (result.error) return decorateResult({ stack, result });
  }

  if (outcome?.score?.sets && !outcome.score.scoreStringSide1) {
    const { score: scoreObject } = matchUpScore({ ...outcome, setTBlast });
    outcome.score = scoreObject;
    outcome.score.sets = outcome.score.sets.filter(
      (set) => set.side1Score || set.side2Score || set.side1TiebreakScore || set.side2TiebreakScore,
    );
  }

  const result = setMatchUpState({
    matchUpStatusCodes: outcome?.matchUpStatusCodes,
    matchUpStatus: outcome?.matchUpStatus,
    winningSide: outcome?.winningSide,
    allowChangePropagation,
    disableScoreValidation,
    score: outcome?.score,
    propagateExitStatus,
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
  if (result.context?.progressExitStatus) {
    let iterate = true;
    let failsafe = 0;
    while (iterate && failsafe < 10) {
      iterate = false;
      failsafe += 1;
      const progressResult = progressExitStatus({
        sourceMatchUpStatusCodes: result.context.sourceMatchUpStatusCodes,
        sourceMatchUpStatus: result.context.sourceMatchUpStatus,
        loserParticipantId: result.context.loserParticipantId,
        propagateExitStatus: params.propagateExitStatus,
        tournamentRecord: params.tournamentRecord,
        loserMatchUp: result.context.loserMatchUp,
        matchUpsMap: result.context.matchUpsMap,
        drawDefinition: params.drawDefinition,
        event: params.event,
      });
      if (progressResult.context?.loserMatchUp) {
        Object.assign(result.context, progressResult.context);
        iterate = true;
      }
    }
  }
  return decorateResult({ result, stack });
}

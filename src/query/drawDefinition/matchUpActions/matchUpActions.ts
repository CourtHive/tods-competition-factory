import { structureAssignedDrawPositions } from '@Query/drawDefinition/positionsGetter';
import { allTournamentMatchUps } from '@Query/matchUps/getAllTournamentMatchUps';
import { isCompletedStructure } from '@Query/drawDefinition/structureActions';
import { isActiveDownstream } from '@Query/drawDefinition/isActiveDownstream';
import { getAppliedPolicies } from '@Query/extensions/getAppliedPolicies';
import { isDirectingMatchUpStatus } from '@Query/matchUp/checkStatusType';
import { collectionMatchUpActions } from './collectionMatchUpActions';
import { getParticipants } from '@Query/participants/getParticipants';
import { getAllDrawMatchUps } from '@Query/matchUps/drawMatchUps';
import { decorateResult } from '@Functions/global/decorateResult';
import { positionTargets } from '@Query/matchUp/positionTargets';
import { getMatchUpsMap } from '@Query/matchUps/getMatchUpsMap';
import { adHocMatchUpActions } from './adHocMatchUpActions';
import { findDrawMatchUp } from '@Acquire/findDrawMatchUp';
import { isAdHoc } from '@Query/drawDefinition/isAdHoc';
import { isString } from '@Tools/objects';
import {
  getEnabledStructures,
  getPolicyActions,
  isAvailableAction,
  MATCHUP_ACTION,
} from '@Query/drawDefinition/positionActions/actionPolicyUtils';

// constants, fixtures and types
import { END, REFEREE, SCHEDULE, SCHEDULE_METHOD, SCORE, START, STATUS } from '@Constants/matchUpActionConstants';
import { POLICY_TYPE_MATCHUP_ACTIONS, POLICY_TYPE_POSITION_ACTIONS } from '@Constants/policyConstants';
import { MatchUpsMap, PolicyDefinitions, TournamentRecords, ResultType } from '@Types/factoryTypes';
import POLICY_MATCHUP_ACTIONS_DEFAULT from '@Fixtures/policies/POLICY_MATCHUP_ACTIONS_DEFAULT';
import { BYE, DOUBLE_DEFAULT, DOUBLE_WALKOVER } from '@Constants/matchUpStatusConstants';
import { DrawDefinition, Event, Participant, Tournament } from '@Types/tournamentTypes';
import { ADD_PENALTY, ADD_PENALTY_METHOD } from '@Constants/positionActionConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { HydratedMatchUp } from '@Types/hydrated';
import {
  INVALID_VALUES,
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_ID,
  MISSING_TOURNAMENT_RECORD,
} from '@Constants/errorConditionConstants';

type MatchUpActionsArgs = {
  inContextDrawMatchUps?: HydratedMatchUp[];
  restrictAdHocRoundParticipants?: boolean;
  tournamentParticipants?: Participant[];
  tournamentRecords?: TournamentRecords;
  policyDefinitions?: PolicyDefinitions;
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  matchUpsMap?: MatchUpsMap;
  enforceGender?: boolean;
  participantId?: string;
  tournamentId?: string;
  sideNumber?: number;
  matchUpId?: string;
  eventId?: string;
  drawId?: string;
  event?: Event;
};
export function matchUpActions(params?: MatchUpActionsArgs): ResultType & {
  structureIsComplete?: boolean;
  isDoubleExit?: boolean;
  isByeMatchUp?: boolean;
  validActions?: any[];
} {
  if (!params) return { error: INVALID_VALUES };
  let { drawDefinition, event } = params;
  const {
    restrictAdHocRoundParticipants = true, // disallow the same participant being in the same round multiple times
    policyDefinitions: specifiedPolicyDefinitions,
    enforceGender,
    participantId,
    sideNumber,
    matchUpId,
  } = params;

  const tournamentRecord =
    params.tournamentRecord ??
    (params.tournamentId && isString(params.tournamentId) && params.tournamentRecords?.[params.tournamentId]);
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  if (!matchUpId || !isString(matchUpId)) return { error: MISSING_MATCHUP_ID };

  if (sideNumber && ![1, 2].includes(sideNumber))
    return decorateResult({
      result: { error: INVALID_VALUES },
      context: { sideNumber },
    });

  if (!drawDefinition) {
    // if matchUp did not have context, find drawId by brute force
    const matchUps = allTournamentMatchUps({ tournamentRecord }).matchUps ?? [];
    const matchUp = matchUps.find((matchUp) => matchUp.matchUpId === matchUpId);
    event = (tournamentRecord?.events ?? []).find((event) => event.eventId === matchUp?.eventId);
    const foundDrawDefinition = (event?.drawDefinitions ?? []).find(
      (drawDefinition) => drawDefinition.drawId === matchUp?.drawId,
    );
    if (foundDrawDefinition) drawDefinition = foundDrawDefinition;
  }

  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const tournamentParticipants = getParticipants({
    withIndividualParticipants: true,
    tournamentRecord,
  }).participants;

  const { drawId } = drawDefinition;
  const { matchUp, structure } = findDrawMatchUp({
    drawDefinition,
    matchUpId,
    event,
  });

  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  const appliedPolicies =
    getAppliedPolicies({
      tournamentRecord,
      drawDefinition,
      structure,
      event,
    }).appliedPolicies ?? {};

  Object.assign(appliedPolicies, specifiedPolicyDefinitions ?? {});

  const otherFlightEntries = appliedPolicies?.[POLICY_TYPE_POSITION_ACTIONS]?.otherFlightEntries;

  const matchUpActionsPolicy =
    appliedPolicies?.[POLICY_TYPE_MATCHUP_ACTIONS] ?? POLICY_MATCHUP_ACTIONS_DEFAULT[POLICY_TYPE_MATCHUP_ACTIONS];

  const { enabledStructures } = getEnabledStructures({
    actionType: MATCHUP_ACTION,
    appliedPolicies,
    drawDefinition,
    structure,
  });

  const { policyActions } = getPolicyActions({
    enabledStructures,
    drawDefinition,
    structure,
  });

  const matchUpsMap = params.matchUpsMap ?? getMatchUpsMap({ drawDefinition });

  const inContextDrawMatchUps =
    params.inContextDrawMatchUps ??
    getAllDrawMatchUps({
      tournamentParticipants,
      inContext: true,
      drawDefinition,
      matchUpsMap,
      event,
    }).matchUps;

  const inContextMatchUp = inContextDrawMatchUps?.find((drawMatchUp) => drawMatchUp.matchUpId === matchUpId);

  const side: any = sideNumber && inContextMatchUp?.sides?.find((side) => side.sideNumber === sideNumber);

  const matchUpParticipantIds =
    inContextMatchUp?.sides
      ?.map((side: any) => side.participantId || side.participant?.participantid)
      .filter(Boolean) ?? [];

  const { assignedPositions, allPositionsAssigned } = structureAssignedDrawPositions({ structure });
  const { structureId } = structure ?? {};

  const validActions: any[] = [];
  if (!structureId) return { validActions };

  const isAdHocMatchUp = isAdHoc({ structure });
  const isCollectionMatchUp = Boolean(matchUp.collectionId);

  if (isAdHocMatchUp && !isCollectionMatchUp) {
    const adHocValidActions = adHocMatchUpActions({
      restrictAdHocRoundParticipants,
      tournamentParticipants,
      matchUpParticipantIds,
      otherFlightEntries,
      drawDefinition,
      structureId,
      sideNumber,
      matchUpId,
      structure,
      matchUp,
      drawId,
      event,
    });
    validActions.push(...adHocValidActions);
  }

  const structureIsComplete = isCompletedStructure({
    drawDefinition,
    structure,
  });

  const participantAssignedDrawPositions = assignedPositions
    ?.filter((assignment) => assignment.participantId)
    .map((assignment) => assignment.drawPosition);

  const byeAssignedDrawPositions = assignedPositions
    ?.filter((assignment) => assignment.bye)
    .map((assignment) => assignment.drawPosition);

  const isByeMatchUp =
    matchUp.matchUpStatus === BYE ||
    (!isCollectionMatchUp &&
      matchUp.drawPositions?.reduce((isByeMatchUp, drawPosition) => {
        return byeAssignedDrawPositions?.includes(drawPosition) || isByeMatchUp;
      }, false));

  if (isByeMatchUp) return { validActions, isByeMatchUp };

  if (isAvailableAction({ policyActions, action: REFEREE })) {
    validActions.push({ type: REFEREE, payload: { matchUpId } });
  }

  const isInComplete = !isDirectingMatchUpStatus({
    matchUpStatus: matchUp.matchUpStatus,
  });

  const structureScoringPolicies = appliedPolicies?.scoring?.structures;
  const stageSpecificPolicies =
    structure?.stage && structureScoringPolicies?.stage && structureScoringPolicies?.stage[structure.stage];
  const sequenceSpecificPolicies =
    structure?.stageSequence &&
    stageSpecificPolicies?.stageSequence &&
    stageSpecificPolicies.stageSequence[structure.stageSequence];
  const requireAllPositionsAssigned =
    appliedPolicies?.scoring?.requireAllPositionsAssigned ||
    stageSpecificPolicies?.requireAllPositionsAssigned ||
    sequenceSpecificPolicies?.requireAllPositionsAssigned;
  const scoringActive = !requireAllPositionsAssigned || allPositionsAssigned;

  const hasParticipants = matchUp.sides && matchUp.sides.filter((side) => side?.participantId).length === 2;

  const isDoubleExit = matchUp.matchUpStatus && [DOUBLE_WALKOVER, DOUBLE_DEFAULT].includes(matchUp.matchUpStatus);

  const targetData = positionTargets({
    inContextDrawMatchUps,
    drawDefinition,
    matchUpId,
  });
  const activeDownstream = isActiveDownstream({
    inContextDrawMatchUps,
    drawDefinition,
    targetData,
  });

  const matchUpDrawPositionsAreAssigned =
    inContextMatchUp?.drawPositions?.length === 2 &&
    inContextMatchUp.drawPositions.every((drawPosition) => participantAssignedDrawPositions?.includes(drawPosition)) &&
    inContextMatchUp?.sides?.length === 2 &&
    inContextMatchUp.sides.every(({ participantId }) => participantId);

  const readyToScore = (matchUpDrawPositionsAreAssigned || hasParticipants) && !(isDoubleExit && activeDownstream);

  const addPenaltyAction = {
    method: ADD_PENALTY_METHOD,
    type: ADD_PENALTY,
    payload: {
      drawId,
      matchUpId,
      penaltyCode: undefined,
      penaltyType: undefined,
      participantIds: [],
      notes: undefined,
    },
  };
  if (isInComplete) {
    validActions.push({
      payload: { drawId, matchUpId, schedule: {} },
      method: SCHEDULE_METHOD,
      type: SCHEDULE,
    });
  }

  if (
    isAvailableAction({ policyActions, action: ADD_PENALTY }) &&
    (side?.participant || (!sideNumber && matchUpParticipantIds?.length))
  ) {
    validActions.push(addPenaltyAction);
  }

  if (isInComplete && readyToScore) validActions.push({ type: STATUS });

  if (scoringActive && readyToScore) {
    const { matchUpId, matchUpFormat } = matchUp;
    const payload = {
      drawId,
      matchUpId,
      matchUpFormat,
      outcome: {
        scoreStringSide1: undefined,
        scoreStringSide2: undefined,
        sets: [],
      },
      winningSide: undefined,
    };
    validActions.push({
      info: 'set outcome and winningSide',
      method: SCHEDULE_METHOD, // setMatchUpStatus
      type: SCORE,
      payload,
    });

    if (isAvailableAction({ policyActions, action: START })) {
      validActions.push({ type: START });
    }
    if (isAvailableAction({ policyActions, action: END })) {
      validActions.push({ type: END });
    }
  }

  if (isCollectionMatchUp && inContextMatchUp) {
    const collectionValidActions = collectionMatchUpActions({
      specifiedPolicyDefinitions,
      inContextDrawMatchUps,
      matchUpParticipantIds,
      matchUpActionsPolicy,
      inContextMatchUp,
      policyActions,
      enforceGender,
      participantId,
      sideNumber,
      matchUpId,
      matchUp,
      drawId,
      side,
    });
    validActions.push(...collectionValidActions);
  }

  return {
    structureIsComplete,
    validActions,
    isDoubleExit,
    ...SUCCESS,
  };
}

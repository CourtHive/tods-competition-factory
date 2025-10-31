import { updateAssignmentParticipantResults } from '@Mutate/drawDefinitions/matchUpGovernor/updateAssignmentParticipantResults';
import { modifyMatchUpNotice, updateInContextMatchUp } from '@Mutate/notifications/drawNotifications';
import { getAllStructureMatchUps } from '@Query/matchUps/getAllStructureMatchUps';
import { getAppliedPolicies } from '@Query/extensions/getAppliedPolicies';
import { checkScoreHasValue } from '@Query/matchUp/checkScoreHasValue';
import { getAllDrawMatchUps } from '@Query/matchUps/drawMatchUps';
import { decorateResult } from '@Functions/global/decorateResult';
import { getMatchUpsMap } from '@Query/matchUps/getMatchUpsMap';
import { findDrawMatchUp } from '@Acquire/findDrawMatchUp';
import { addNotes } from '@Mutate/base/addRemoveNotes';
import { isAdHoc } from '@Query/drawDefinition/isAdHoc';
import { isLucky } from '@Query/drawDefinition/isLucky';
import { getTopics } from '@Global/state/globalState';
import { unique } from '@Tools/arrays';

// types, constants and fixtures
import { DrawDefinition, Event, MatchUp, MatchUpStatusUnion, Tournament } from '@Types/tournamentTypes';
import { MATCHUP_NOT_FOUND } from '@Constants/errorConditionConstants';
import { UPDATE_INCONTEXT_MATCHUP } from '@Constants/topicConstants';
import { MatchUpsMap, PolicyDefinitions } from '@Types/factoryTypes';
import { removeExtension } from '@Mutate/extensions/removeExtension';
import { toBePlayed } from '@Fixtures/scoring/outcomes/toBePlayed';
import { POLICY_TYPE_SCORING } from '@Constants/policyConstants';
import { addExtension } from '@Mutate/extensions/addExtension';
import { CONTAINER } from '@Constants/drawDefinitionConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { TEAM } from '@Constants/matchUpTypes';
import {
  AWAITING_RESULT,
  completedMatchUpStatuses,
  DOUBLE_WALKOVER,
  SUSPENDED,
  DEFAULTED,
  WALKOVER,
  IN_PROGRESS,
  INCOMPLETE,
} from '@Constants/matchUpStatusConstants';

/**
 *
 * Single place where matchUp.score can be modified.
 *
 * Mutates passed matchUp object.
 * Moving forward this will be used for integrity checks and any middleware that needs to execute
 *
 */

type ModifyMatchUpScoreArgs = {
  matchUpStatus?: MatchUpStatusUnion;
  appliedPolicies?: PolicyDefinitions;
  carriedOverStatusSides?: boolean[];
  drawDefinition?: DrawDefinition;
  tournamentRecord?: Tournament;
  matchUpStatusCodes?: string[];
  removeWinningSide?: boolean;
  matchUpsMap?:MatchUpsMap;
  matchUpFormat?: string;
  removeScore?: boolean;
  winningSide?: number;
  matchUpId: string;
  matchUp: MatchUp; // matchUp without context
  notes?: string;
  context?: any;
  event?: Event;
  score?: any;
};

export function modifyMatchUpScore(params: ModifyMatchUpScoreArgs) {
  const stack = 'modifyMatchUpScore';
  let matchUpFormat = params.matchUpFormat;
  let matchUp = params.matchUp; // matchUp without context
  let structure;

  const {
    carriedOverStatusSides,
    matchUpStatusCodes,
    tournamentRecord,
    drawDefinition,
    matchUpsMap,
    matchUpStatus,
    removeScore,
    winningSide,
    matchUpId,
    event,
    notes,
    score,
  } = params;

  const hasPolicies = params.appliedPolicies && Object.keys(params.appliedPolicies).length;

  const appliedPolicies = hasPolicies
    ? params.appliedPolicies
    : getAppliedPolicies({
        policyTypes: [POLICY_TYPE_SCORING],
        tournamentRecord,
        drawDefinition,
        structure,
        event,
      })?.appliedPolicies;

  const isDualMatchUp = matchUp.matchUpType === TEAM;

  if (isDualMatchUp && drawDefinition) {
    if (matchUpId && matchUp.matchUpId !== matchUpId) {
      // the modification is to be applied to a tieMatchUp
      const findResult = findDrawMatchUp({
        drawDefinition,
        matchUpId,
        event,
      });
      if (!findResult.matchUp) return { error: MATCHUP_NOT_FOUND };
      ({ matchUp, structure } = findResult);
    } else {
      // the modification is to be applied to the TEAM matchUp
    }
  } else if (matchUp.matchUpId !== matchUpId) {
    console.log('!!!!!');
  }

  if ((matchUpStatus && [WALKOVER, DOUBLE_WALKOVER].includes(matchUpStatus)) || removeScore) {
    
    //TODO: we want to remove the carriedOverStatusSides extension for a consolation match only
    //if one of the parent matches has been cleared and not when we clear the score for itself.

    //if one of the parent matches is a WO,DEF then do not remove the carriedOverStatusSides extensions.
    //figure out if participant had a wo/default/withdrawl exit from the previous match, if so mark it.
    const upStreamWOExits = matchUpsMap?.drawMatchUps.find(
      (m) => m.loserMatchUpId === matchUp.matchUpId && [WALKOVER, DEFAULTED].includes(m.matchUpStatus),
    );
    if (!upStreamWOExits) {
      removeExtension({
        name: 'carriedOverStatusSides',
        element: matchUp,
      });
    }
    Object.assign(matchUp, { ...toBePlayed });
  } else if (score) {
    matchUp.score = score;
  }

  const wasDefaulted = matchUpStatus && matchUp?.matchUpStatus === DEFAULTED && matchUpStatus !== DEFAULTED;

  if (matchUpStatus) matchUp.matchUpStatus = matchUpStatus;
  if (matchUpFormat) matchUp.matchUpFormat = matchUpFormat;
  if (matchUpStatusCodes) matchUp.matchUpStatusCodes = matchUpStatusCodes;
  if (winningSide) matchUp.winningSide = winningSide;
  if (carriedOverStatusSides) {
    addExtension({
      element: matchUp,
      extension: {
        name: 'carriedOverStatusSides',
        value: carriedOverStatusSides,
      },
    });
  }
  if (params.removeWinningSide)
    // removeWinningSide directive calculated upstream
    matchUp.winningSide = undefined;

  if (!structure && drawDefinition) {
    ({ structure } = findDrawMatchUp({
      drawDefinition,
      matchUpId,
      event,
    }));
  }

  if (
    matchUpStatus &&
    !matchUp.winningSide &&
    checkScoreHasValue(matchUp) &&
    !completedMatchUpStatuses.includes(matchUpStatus) &&
    ![AWAITING_RESULT, SUSPENDED, INCOMPLETE].includes(matchUpStatus)
  ) {
    matchUp.matchUpStatus = IN_PROGRESS;
  }

  let defaultedProcessCodes;
  if ((wasDefaulted && matchUp?.processCodes?.length) || matchUpStatus === DEFAULTED) {
    defaultedProcessCodes = appliedPolicies?.[POLICY_TYPE_SCORING]?.processCodes?.incompleteAssignmentsOnDefault;
  }

  if (!matchUp.collectionId) {
    const isRoundRobin = structure?.structureType === CONTAINER;
    const isAdHocStructure = isAdHoc({ structure });
    if (isLucky({ drawDefinition, structure }) || isAdHocStructure || isRoundRobin) {
      const updateTally = (structure) => {
        // matchUpFormat set here is only used in updateAssignmentParticipantResults
        matchUpFormat = isDualMatchUp
          ? 'SET1-S:T100'
          : (matchUpFormat ??
            matchUp.matchUpFormat ??
            structure?.matchUpFormat ??
            drawDefinition?.matchUpFormat ??
            event?.matchUpFormat);

        const matchUpFilters = isDualMatchUp ? { matchUpTypes: [TEAM] } : undefined;
        const { matchUps } = getAllStructureMatchUps({
          afterRecoveryTimes: false,
          tournamentRecord,
          inContext: true,
          matchUpFilters,
          drawDefinition,
          structure,
          event,
        });

        if (isAdHocStructure) {
          structure.positionAssignments = unique(
            matchUps.flatMap((matchUp) => (matchUp.sides ?? []).map((side) => side.participantId)).filter(Boolean),
          ).map((participantId) => ({ participantId }));
        }

        return updateAssignmentParticipantResults({
          positionAssignments: structure.positionAssignments,
          tournamentRecord,
          drawDefinition,
          matchUpFormat,
          matchUps,
          event,
        });
      };

      const itemStructure =
        isRoundRobin &&
        structure.structures.find((itemStructure) => {
          return itemStructure?.matchUps.find((matchUp) => matchUp.matchUpId === matchUpId);
        });

      const result = updateTally(itemStructure || structure);
      if (result.error) return decorateResult({ result, stack });
    }
  }

  if (notes) {
    const result = addNotes({ element: matchUp, notes });
    if (result.error) return decorateResult({ result, stack });
  }

  const tournamentId = tournamentRecord?.tournamentId;
  const sendInContext = getTopics().topics.includes(UPDATE_INCONTEXT_MATCHUP);
  const updatedMatchUpsMap = (sendInContext || defaultedProcessCodes) && getMatchUpsMap({ drawDefinition });
  const inContextMatchUp =
    updatedMatchUpsMap &&
    getAllDrawMatchUps({
      // client will not normally be receiving participants for the first time...
      // ... and should therefore already have groupings / ratings / rankings for participants
      // participantsProfile: { withGroupings: true },
      matchUpFilters: { matchUpIds: [matchUpId] },
      nextMatchUps: true,
      tournamentRecord, // required to hydrate participants
      inContext: true,
      drawDefinition,
      matchUpsMap: updatedMatchUpsMap,
    }).matchUps?.[0];

  if (sendInContext && inContextMatchUp) {
    updateInContextMatchUp({ tournamentId, inContextMatchUp });
  }

  if (
    Array.isArray(defaultedProcessCodes) &&
    inContextMatchUp &&
    !inContextMatchUp.sides?.every(({ participantId }) => participantId)
  ) {
    if (matchUpStatus === DEFAULTED) {
      matchUp.processCodes = unique([...(matchUp.processCodes ?? []), ...defaultedProcessCodes]);
    } else {
      for (const processCode of defaultedProcessCodes || []) {
        const codeIndex = processCode && matchUp?.processCodes?.lastIndexOf(processCode);
        // remove only one instance of processCode
        matchUp?.processCodes?.splice(codeIndex, 1);
      }
    }
  }

  modifyMatchUpNotice({
    eventId: event?.eventId,
    context: stack,
    drawDefinition,
    tournamentId,
    matchUp,
  });

  return { ...SUCCESS };
}

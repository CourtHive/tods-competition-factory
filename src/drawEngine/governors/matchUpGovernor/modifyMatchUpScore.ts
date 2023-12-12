import { addNotes } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveNotes';
import { scoreHasValue } from '../../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { updateAssignmentParticipantResults } from './updateAssignmentParticipantResults';
import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { findDrawMatchUp } from '../../getters/getMatchUps/findDrawMatchUp';
import { getTopics } from '../../../global/state/globalState';
import { isAdHoc } from '../queryGovernor/isAdHoc';
import { isLucky } from '../queryGovernor/isLucky';
import { unique } from '../../../utilities';
import {
  modifyMatchUpNotice,
  updateInContextMatchUp,
} from '../../notifications/drawNotifications';

import { MATCHUP_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { UPDATE_INCONTEXT_MATCHUP } from '../../../constants/topicConstants';
import { POLICY_TYPE_SCORING } from '../../../constants/policyConstants';
import { CONTAINER } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  AWAITING_RESULT,
  completedMatchUpStatuses,
  DOUBLE_WALKOVER,
  SUSPENDED,
  DEFAULTED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';
import {
  DrawDefinition,
  Event,
  MatchUp,
  MatchUpStatusEnum,
  Tournament,
} from '../../../types/tournamentFromSchema';

/**
 *
 * Single place where matchUp.score can be modified.
 *
 * Mutates passed matchUp object.
 * Moving forward this will be used for integrity checks and any middleware that needs to execute
 *
 */

type ModifyMatchUpScoreArgs = {
  matchUpStatus?: MatchUpStatusEnum;
  tournamentRecord?: Tournament;
  matchUpStatusCodes?: string[];
  drawDefinition?: DrawDefinition;
  removeWinningSide?: boolean;
  matchUpFormat?: string;
  removeScore?: boolean;
  winningSide?: number;
  matchUpId: string;
  matchUp: MatchUp; // matchUp without context
  notes?: string;
  event?: Event;
  score?: any;
};

export function modifyMatchUpScore({
  matchUpStatusCodes,
  removeWinningSide,
  tournamentRecord,
  drawDefinition,
  matchUpFormat,
  matchUpStatus,
  removeScore,
  winningSide,
  matchUpId,
  matchUp, // matchUp without context
  event,
  notes,
  score,
}: ModifyMatchUpScoreArgs) {
  const stack = 'modifyMatchUpScore';
  let structure;

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

  if (
    (matchUpStatus && [WALKOVER, DOUBLE_WALKOVER].includes(matchUpStatus)) ||
    removeScore
  ) {
    Object.assign(matchUp, { ...toBePlayed });
  } else if (score) {
    matchUp.score = score;
  }

  const wasDefaulted =
    matchUpStatus &&
    matchUp?.matchUpStatus === DEFAULTED &&
    matchUpStatus !== DEFAULTED;

  if (matchUpStatus) matchUp.matchUpStatus = matchUpStatus;
  if (matchUpFormat) matchUp.matchUpFormat = matchUpFormat;
  if (matchUpStatusCodes) matchUp.matchUpStatusCodes = matchUpStatusCodes;
  if (winningSide) matchUp.winningSide = winningSide;
  if (removeWinningSide) matchUp.winningSide = undefined;

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
    scoreHasValue(matchUp) &&
    !completedMatchUpStatuses.includes(matchUpStatus) &&
    ![AWAITING_RESULT, SUSPENDED].includes(matchUpStatus)
  ) {
    matchUp.matchUpStatus = MatchUpStatusEnum.InProgress;
  }

  let defaultedProcessCodes;
  if (
    (wasDefaulted && matchUp?.processCodes?.length) ||
    matchUpStatus === DEFAULTED
  ) {
    const appliedPolicies = getAppliedPolicies({
      tournamentRecord,
      drawDefinition,
      structure,
      event,
    })?.appliedPolicies;

    defaultedProcessCodes =
      appliedPolicies?.[POLICY_TYPE_SCORING]?.processCodes
        ?.incompleteAssignmentsOnDefault;
  }

  if (!matchUp.collectionId) {
    const isRoundRobin = structure?.structureType === CONTAINER;
    const isAdHocStructure = isAdHoc({ drawDefinition, structure });
    if (
      isLucky({ drawDefinition, structure }) ||
      isAdHocStructure ||
      isRoundRobin
    ) {
      const updateTally = (structure) => {
        // matchUpFormat set here is only used in updateAssignmentParticipantResults
        matchUpFormat = isDualMatchUp
          ? 'SET1-S:T100'
          : matchUpFormat ??
            matchUp.matchUpFormat ??
            structure?.matchUpFormat ??
            drawDefinition?.matchUpFormat ??
            event?.matchUpFormat;

        const matchUpFilters = isDualMatchUp
          ? { matchUpTypes: [TEAM] }
          : undefined;
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
            matchUps
              .flatMap((matchUp) =>
                (matchUp.sides ?? []).map((side) => side.participantId)
              )
              .filter(Boolean)
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
          return itemStructure?.matchUps.find(
            (matchUp) => matchUp.matchUpId === matchUpId
          );
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
  const matchUpsMap =
    (sendInContext || defaultedProcessCodes) &&
    getMatchUpsMap({ drawDefinition });
  const inContextMatchUp =
    matchUpsMap &&
    getAllDrawMatchUps({
      // client will not normally be receiving participants for the first time...
      // ... and should therefore already have groupings / ratings / rankings for participants
      // participantsProfile: { withGroupings: true },
      matchUpFilters: { matchUpIds: [matchUpId] },
      nextMatchUps: true,
      tournamentRecord, // required to hydrate participants
      inContext: true,
      drawDefinition,
      matchUpsMap,
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
      matchUp.processCodes = unique([
        ...(matchUp.processCodes ?? []),
        ...defaultedProcessCodes,
      ]);
    } else {
      for (const processCode of defaultedProcessCodes || []) {
        const codeIndex =
          processCode && matchUp?.processCodes?.lastIndexOf(processCode);
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

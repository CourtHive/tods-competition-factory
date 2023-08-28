import { addNotes } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveNotes';
import { scoreHasValue } from '../../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { updateAssignmentParticipantResults } from './updateAssignmentParticipantResults';
import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { getTopics } from '../../../global/state/globalState';
import {
  modifyMatchUpNotice,
  updateInContextMatchUp,
} from '../../notifications/drawNotifications';

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
import { MATCHUP_NOT_FOUND } from '../../../constants/errorConditionConstants';

/**
 *
 * Single place where matchUp.score can be modified.
 *
 * Mutates passed matchUp object.
 * Moving forward this will be used for integrity checks and any middleware that needs to execute
 *
 * @param {object} drawDefinition
 * @param {object=} matchUp
 * @param {object=} event
 * @param {string=} matchUpId
 * @param {object=} score
 * @param {string=} matchUpStatus - e.g. COMPLETED, BYE, TO_BE_PLAYED, WALKOVER, DEFAULTED
 * @param {string[]=} matchUpStatusCodes - optional - organization specific
 * @param {number=} winningSide - optional - 1 or 2
 * @param {boolean=} removeWinningSide
 * @param {boolean=} removeScore
 * @param {object=} tournamentRecord
 * @param {string=} matchUpFormat
 * @param {string[]=} notes
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
      const findResult = findMatchUp({
        drawDefinition,
        matchUpId,
        event,
      });
      if (!findResult.matchUp) return { error: MATCHUP_NOT_FOUND };
      ({ matchUp, structure } = findResult);
    } else {
      // the modification is to be applied to the TEAM matchUp
    }
  } else {
    if (matchUp.matchUpId !== matchUpId) console.log('!!!!!');
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
    ({ structure } = findMatchUp({
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

  // if the matchUp has a collectionId it is a tieMatchUp contained in a dual matchUp
  if (structure?.structureType === CONTAINER && !matchUp.collectionId) {
    // matchUpFormat set here is only used in updateAssignmentParticipantResults
    matchUpFormat = isDualMatchUp
      ? 'SET1-S:T100'
      : matchUpFormat ||
        matchUp.matchUpFormat ||
        structure?.matchUpFormat ||
        drawDefinition?.matchUpFormat ||
        event?.matchUpFormat;

    const itemStructure = structure.structures.find((itemStructure) => {
      return itemStructure?.matchUps.find(
        (matchUp) => matchUp.matchUpId === matchUpId
      );
    });

    const matchUpFilters = isDualMatchUp && { matchUpTypes: [TEAM] };
    const { matchUps } = getAllStructureMatchUps({
      afterRecoveryTimes: false,
      structure: itemStructure,
      inContext: true,
      matchUpFilters,
      event,
    });

    const result = updateAssignmentParticipantResults({
      positionAssignments: itemStructure.positionAssignments,
      tournamentRecord,
      drawDefinition,
      matchUpFormat,
      matchUps,
      event,
    });
    if (result.error) return decorateResult({ result, stack });
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
      if (matchUp.processCodes) {
        matchUp.processCodes.push(...defaultedProcessCodes);
      } else {
        matchUp.processCodes = defaultedProcessCodes;
      }
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

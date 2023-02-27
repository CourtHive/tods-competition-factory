import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { modifyMatchUpNotice } from '../../../drawEngine/notifications/drawNotifications';
import { getCollectionPositionAssignments } from './getCollectionPositionAssignments';
import { getPairedParticipant } from '../participantGovernor/getPairedParticipant';
import { deleteParticipants } from '../participantGovernor/deleteParticipants';
import { decorateResult } from '../../../global/functions/decorateResult';
import { addParticipant } from '../participantGovernor/addParticipants';
import { updateTeamLineUp } from './drawDefinitions/updateTeamLineUp';
import { findExtension } from '../queryGovernor/extensionQueries';
import { getTieMatchUpContext } from './getTieMatchUpContext';
import { makeDeepCopy } from '../../../utilities';

import POLICY_MATCHUP_ACTIONS_DEFAULT from '../../../fixtures/policies/POLICY_MATCHUP_ACTIONS_DEFAULT';
import { POLICY_TYPE_MATCHUP_ACTIONS } from '../../../constants/policyConstants';
import { COMPETITOR } from '../../../constants/participantRoles';
import { LINEUPS } from '../../../constants/extensionConstants';
import { PAIR } from '../../../constants/participantConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { DOUBLES } from '../../../constants/matchUpTypes';
import {
  INVALID_PARTICIPANT_TYPE,
  MISSING_PARTICIPANT_ID,
  NOT_FOUND,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function replaceTieMatchUpParticipantId(params) {
  const matchUpContext = getTieMatchUpContext(params);
  if (matchUpContext.error) return matchUpContext;
  const stack = 'replaceTieMatchUpParticipantid';

  const {
    existingParticipantId,
    tournamentRecord,
    newParticipantId,
    drawDefinition,
    substitution,
    event,
  } = params;

  if (!existingParticipantId || !newParticipantId)
    return decorateResult({ result: { error: MISSING_PARTICIPANT_ID }, stack });

  if (existingParticipantId === newParticipantId) return { ...SUCCESS };

  const {
    inContextDualMatchUp,
    inContextTieMatchUp,
    collectionPosition,
    collectionId,
    dualMatchUp,
    tieMatchUp,
    tieFormat,
  } = matchUpContext;

  const { matchUpType } = inContextTieMatchUp;

  const side = inContextTieMatchUp.sides?.find(
    (side) =>
      side.participant?.participantId === existingParticipantId ||
      side.participant?.individualParticipantIds?.includes(
        existingParticipantId
      )
  );
  if (!side) return { error: PARTICIPANT_NOT_FOUND };

  const { tournamentParticipants: targetParticipants } =
    getTournamentParticipants({
      tournamentRecord,
      participantFilters: {
        participantIds: [existingParticipantId, newParticipantId],
      },
    });

  if (targetParticipants.length !== 2)
    return decorateResult({ result: { error: MISSING_PARTICIPANT_ID }, stack });
  if (
    targetParticipants[0].participantType !==
    targetParticipants[1].participantType
  )
    return decorateResult({
      result: { error: INVALID_PARTICIPANT_TYPE },
      stack,
    });

  const { appliedPolicies } = getAppliedPolicies({
    tournamentRecord,
    drawDefinition,
    event,
  });

  const matchUpActionsPolicy =
    appliedPolicies?.[POLICY_TYPE_MATCHUP_ACTIONS] ||
    POLICY_MATCHUP_ACTIONS_DEFAULT[POLICY_TYPE_MATCHUP_ACTIONS];

  const substitutionProcessCode = matchUpActionsPolicy?.substitutionProcessCode;

  const { extension } = findExtension({
    element: drawDefinition,
    name: LINEUPS,
  });

  const lineUps = extension?.value || {};

  if (!dualMatchUp.sides?.length) {
    const extractSideDetail = ({
      displaySideNumber,
      drawPosition,
      sideNumber,
    }) => ({ drawPosition, sideNumber, displaySideNumber });

    dualMatchUp.sides = inContextDualMatchUp.sides.map((side) => {
      const participantId = side.participantId;
      return {
        ...extractSideDetail(side),
        lineUp: (participantId && lineUps[participantId]) || [],
      };
    });
  }

  const dualMatchUpSide = dualMatchUp.sides.find(
    ({ sideNumber }) => sideNumber === side.sideNumber
  );

  if (!dualMatchUpSide) {
    return decorateResult({
      result: {
        sideNumber: side.sideNumber,
        existingParticipantId,
        error: NOT_FOUND,
      },
      stack,
    });
  }

  const teamParticipantId = inContextDualMatchUp.sides?.find(
    ({ sideNumber }) => sideNumber === side.sideNumber
  )?.participantId;

  const teamLineUp = dualMatchUpSide.lineUp;
  const newParticipantIdInLineUp = teamLineUp?.find(
    ({ participantId }) => newParticipantId === participantId
  );

  const substitutionOrder = teamLineUp?.reduce(
    (order, teamCompetitor) =>
      teamCompetitor.substitutionOrder > order
        ? teamCompetitor.substitutionOrder
        : order,
    0
  );

  const modifiedLineUp =
    teamLineUp?.map((teamCompetitor) => {
      const modifiedCompetitor = makeDeepCopy(teamCompetitor, false, true);

      // if the current competitor is not either id, return as is
      if (
        ![existingParticipantId, newParticipantId].includes(
          modifiedCompetitor.participantId
        )
      ) {
        return modifiedCompetitor;
      }

      // if current competitor includes an id then filter out current assignment
      if (
        !substitution &&
        [existingParticipantId, newParticipantId].includes(
          modifiedCompetitor.participantId
        )
      ) {
        modifiedCompetitor.collectionAssignments =
          modifiedCompetitor.collectionAssignments?.filter(
            (assignment) =>
              !(
                assignment.collectionPosition === collectionPosition &&
                assignment.collectionId === collectionId
              )
          );
      }

      if (
        substitution &&
        existingParticipantId === modifiedCompetitor.participantId
      ) {
        modifiedCompetitor.collectionAssignments =
          modifiedCompetitor.collectionAssignments.map((assignment) => {
            if (
              assignment.collectionPosition === collectionPosition &&
              assignment.collectionId === collectionId &&
              assignment.substitutionOrder === undefined
            ) {
              return { ...assignment, substitutionOrder };
            }
            return assignment;
          });
      }

      // if current competitor is newParticipantId, push the new assignment
      if (modifiedCompetitor.participantId === newParticipantId) {
        if (!modifiedCompetitor.collectionAssignments)
          modifiedCompetitor.collectionAssignments = [];
        const assignment = { collectionId, collectionPosition };
        if (substitution) {
          assignment.previousParticipantId = existingParticipantId;
          assignment.substitutionOrder = substitutionOrder + 1;
        }
        modifiedCompetitor.collectionAssignments.push(assignment);
      }

      return modifiedCompetitor;
    }) || [];

  if (!newParticipantIdInLineUp) {
    const collectionAssignment = { collectionId, collectionPosition };
    if (substitution) {
      collectionAssignment.substitutionOrder = substitutionOrder + 1;
      collectionAssignment.previousParticipantId = existingParticipantId;
    }
    const assignment = {
      collectionAssignments: [collectionAssignment],
      participantId: newParticipantId,
    };
    modifiedLineUp.push(assignment);
  }

  const isDoubles = matchUpType === DOUBLES;

  const { assignedParticipantIds: existingIndividualParticipantIds } =
    getCollectionPositionAssignments({
      lineUp: teamLineUp,
      collectionPosition,
      collectionId,
    });

  // now check whether new pairParticipant exists
  const { assignedParticipantIds: individualParticipantIds } =
    getCollectionPositionAssignments({
      lineUp: modifiedLineUp,
      collectionPosition,
      collectionId,
    });

  dualMatchUpSide.lineUp = modifiedLineUp;

  if (teamParticipantId) {
    const result = updateTeamLineUp({
      participantId: teamParticipantId,
      lineUp: modifiedLineUp,
      drawDefinition,
      tieFormat,
    });
    if (result.error) return decorateResult({ result, stack });
  } else {
    console.log('team participantId not found');
  }

  let participantAdded, participantRemoved;
  if (isDoubles) {
    const { tournamentRecord } = params;
    let result = getPairedParticipant({
      participantIds: individualParticipantIds,
      tournamentRecord,
    });

    if (!result.participant) {
      const participant = {
        participantRole: COMPETITOR,
        individualParticipantIds,
        participantType: PAIR,
      };
      const result = addParticipant({
        returnParticipant: true,
        pairOverride: true,
        tournamentRecord,
        participant,
      });
      if (result.error) return decorateResult({ result, stack });
      participantAdded = result.participant?.participantId;
    }

    // now attempt to cleanup/delete previous pairParticipant
    result = getPairedParticipant({
      participantIds: existingIndividualParticipantIds,
      tournamentRecord,
    });
    const existingPairParticipantId = result.participant?.participantId;
    if (existingPairParticipantId) {
      const result = deleteParticipants({
        participantIds: [existingPairParticipantId],
        tournamentRecord,
      });
      if (result.success) participantRemoved = existingPairParticipantId;
    }
  }

  if (substitution || side.substitutions?.length === 1) {
    if (substitution) {
      const processCodes = tieMatchUp.processCodes || [];
      processCodes.push(substitutionProcessCode);

      tieMatchUp.processCodes = processCodes;
    } else {
      // if there was only one substitution, remove processCode
      const codeIndex = tieMatchUp.processCodes.lastIndexOf(
        substitutionProcessCode
      );
      // remove only one instance of substitutionProcessCode
      tieMatchUp.processCodes.splice(codeIndex, 1);
    }

    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      matchUp: tieMatchUp,
      context: stack,
      drawDefinition,
    });
  }

  modifyMatchUpNotice({
    tournamentId: tournamentRecord?.tournamentId,
    matchUp: dualMatchUp,
    context: stack,
    drawDefinition,
  });

  return { ...SUCCESS, modifiedLineUp, participantRemoved, participantAdded };
}

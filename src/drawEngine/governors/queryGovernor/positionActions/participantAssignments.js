import { getDrawMatchUps } from '../../../getters/getMatchUps/drawMatchUps';
import { getQualifiersData } from '../../positionGovernor/positionQualifiers';
import { findStructure } from '../../../getters/findStructure';
import { getNextSeedBlock } from '../../../getters/seedGetter';
import { unique } from '../../../../utilities';

import {
  ASSIGN_BYE,
  ASSIGN_BYE_METHOD,
  ASSIGN_PARTICIPANT,
  ASSIGN_PARTICIPANT_METHOD,
} from '../../../../constants/positionActionConstants';

export function getValidAssignmentActions({
  drawDefinition,
  structureId,
  drawPosition,
  isByePosition,
  policyDefinition,
  positionAssignments,
  tournamentParticipants,
  isWinRatioFedStructure,
  possiblyDisablingAction,
  unassignedParticipantIds,
  positionSourceStructureIds,
}) {
  const { drawId } = drawDefinition;
  const validAssignmentActions = [];
  const { structure } = findStructure({ drawDefinition, structureId });

  let unplacedSeedParticipantIds,
    unplacedSeedAssignments,
    unfilledPositions = [];

  const ignoreSeedPositions =
    policyDefinition?.seeding?.validSeedPositions?.ignore;

  if (!ignoreSeedPositions) {
    const result = getNextSeedBlock({
      drawDefinition,
      structureId,
      randomize: true,
    });
    ({
      unplacedSeedParticipantIds,
      unplacedSeedAssignments,
      unfilledPositions,
    } = result);
  }

  // if there are no unfilledPositions for available seeds then return all unfilled positions
  if (!unfilledPositions?.length) {
    unfilledPositions = positionAssignments
      .filter(
        (assignment) =>
          !assignment.participantId && !assignment.bye && !assignment.qualifier
      )
      .map((assignment) => assignment.drawPosition);
  }

  if (!isByePosition) {
    validAssignmentActions.push({
      type: ASSIGN_BYE,
      method: ASSIGN_BYE_METHOD,
      willDisableLinks: possiblyDisablingAction,
      payload: { drawId, structureId, drawPosition },
    });
  }
  if (isWinRatioFedStructure && ignoreSeedPositions) {
    const assignedParticipantIds = positionAssignments
      .map((assignment) => assignment.participantId)
      .filter((f) => f);

    const matchUpFilters = { structureIds: positionSourceStructureIds };
    const { completedMatchUps } = getDrawMatchUps({
      inContext: true,
      matchUpFilters,
      drawDefinition,
    });

    const availableParticipantIds = unique(
      (completedMatchUps || [])
        ?.map(({ sides }) => sides.map(({ participantId }) => participantId))
        .flat()
        .filter(
          (participantId) => !assignedParticipantIds.includes(participantId)
        )
    );

    const participantsAvailable = tournamentParticipants?.filter(
      (participant) =>
        availableParticipantIds?.includes(participant.participantId)
    );

    participantsAvailable?.forEach((participant) => {
      const entry = (drawDefinition.entries || []).find(
        (entry) => entry.participantId === participant.participantId
      );
      participant.entryPosition = entry?.entryPosition;
    });
    if (participantsAvailable?.length) {
      validAssignmentActions.push({
        type: ASSIGN_PARTICIPANT,
        method: ASSIGN_PARTICIPANT_METHOD,
        availableParticipantIds,
        participantsAvailable,
        willDisableLinks: possiblyDisablingAction,
        payload: { drawId, structureId, drawPosition },
      });
    }
    return { validAssignmentActions };
  }
  if (unfilledPositions.includes(drawPosition) || isByePosition) {
    let availableParticipantIds;
    if (unplacedSeedAssignments?.length) {
      // return any valid seedAssignments
      const validToAssign = unplacedSeedAssignments.filter((seedAssignment) =>
        unplacedSeedParticipantIds?.includes(seedAssignment.participantId)
      );

      validToAssign.sort(validAssignmentsSort);
      availableParticipantIds = validToAssign.map(
        (assignment) => assignment.participantId
      );
    } else {
      // otherwise look for any unplaced entries
      // 1) unassigned DIRECT_ACCEPTANCE or WILDCARD structure entries
      availableParticipantIds = unassignedParticipantIds;

      // 2) unassigned qualifer entries
      const { unplacedQualifiersCount } = getQualifiersData({
        drawDefinition,
        structure,
      });
      if (unplacedQualifiersCount) console.log({ unplacedQualifiersCount });
    }

    // add structureId and drawPosition to the payload so the client doesn't need to discover
    const participantsAvailable = tournamentParticipants?.filter(
      (participant) =>
        availableParticipantIds.includes(participant.participantId)
    );
    if (participantsAvailable?.length) {
      validAssignmentActions.push({
        type: ASSIGN_PARTICIPANT,
        method: ASSIGN_PARTICIPANT_METHOD,
        availableParticipantIds,
        participantsAvailable,
        willDisableLinks: possiblyDisablingAction,
        payload: { drawId, structureId, drawPosition },
      });
    }
    return { validAssignmentActions };
  } else {
    return { message: 'No valid assignment actions' };
  }
}

function validAssignmentsSort(a, b) {
  if (a.bye) return -1;
  if (a.seedValue < b.seedValue || (a.seedValue && !b.seedValue)) return -1;
  return (a.seedNumber || 0) - (b.seedNumber || 0);
}

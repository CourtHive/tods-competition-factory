import { getQualifiersData } from '../../positionGovernor/positionQualifiers';
import { getDrawMatchUps } from '../../../getters/getMatchUps/drawMatchUps';
import { getParticipantId } from '../../../../global/functions/extractors';
import { getNextSeedBlock } from '../../../getters/seedGetter';
import { unique } from '../../../../utilities';

import { POLICY_TYPE_SEEDING } from '../../../../constants/policyConstants';
import { TEAM } from '../../../../constants/eventConstants';
import {
  ASSIGN_BYE,
  ASSIGN_BYE_METHOD,
  ASSIGN_PARTICIPANT,
  ASSIGN_PARTICIPANT_METHOD,
} from '../../../../constants/positionActionConstants';

export function getValidAssignmentActions({
  positionSourceStructureIds,
  unassignedParticipantIds,
  possiblyDisablingAction,
  tournamentParticipants,
  isWinRatioFedStructure,
  positionAssignments,
  policyDefinitions,
  drawDefinition,
  isByePosition,
  drawPosition,
  structureId,
  structure,
  event,
}) {
  const { drawId } = drawDefinition;
  const validAssignmentActions = [];

  let unplacedSeedParticipantIds,
    unplacedSeedAssignments,
    unfilledPositions = [];

  const ignoreSeedPositions =
    policyDefinitions?.[POLICY_TYPE_SEEDING]?.validSeedPositions?.ignore;

  if (!ignoreSeedPositions) {
    const result = getNextSeedBlock({
      randomize: true,
      drawDefinition,
      structureId,
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
      .filter(Boolean);

    const matchUpFilters = { structureIds: positionSourceStructureIds };
    const { completedMatchUps } = getDrawMatchUps({
      inContext: true,
      matchUpFilters,
      drawDefinition,
    });

    const availableParticipantIds = unique(
      (completedMatchUps || [])
        // filter completedMatchUps to exclude SINGLES/DOUBLES for TEAM events
        .filter(
          ({ matchUpType }) => event?.eventType !== TEAM || matchUpType === TEAM
        )
        ?.map(({ sides }) => sides.map(getParticipantId))
        .flat()
        .filter(
          (participantId) =>
            participantId && !assignedParticipantIds.includes(participantId)
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
        structureId,
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
  }

  return { validAssignmentActions };
}

function validAssignmentsSort(a, b) {
  if (a.bye) return -1;
  if (a.seedValue < b.seedValue || (a.seedValue && !b.seedValue)) return -1;
  return (a.seedNumber || 0) - (b.seedNumber || 0);
}

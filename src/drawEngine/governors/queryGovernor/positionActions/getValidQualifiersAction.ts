import { getSourceStructureIdsAndRelevantLinks } from '../../../getters/getSourceStructureIdsAndRelevantLinks';
import { findExtension } from '../../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { getPositionAssignments } from '../../../getters/positionsGetter';
import { definedAttributes } from '../../../../utilities/objects';
import { isCompletedStructure } from '../structureActions';

import { POLICY_TYPE_POSITION_ACTIONS } from '../../../../constants/policyConstants';
import { BYE } from '../../../../constants/matchUpStatusConstants';
import { TALLY } from '../../../../constants/extensionConstants';
import { HydratedParticipant } from '../../../../types/hydrated';
import {
  QUALIFYING_PARTICIPANT,
  QUALIFYING_PARTICIPANT_METHOD,
} from '../../../../constants/positionActionConstants';
import {
  POSITION,
  QUALIFYING,
  WINNER,
} from '../../../../constants/drawDefinitionConstants';

export function getValidQualifiersAction({
  /*
  activeDrawPositions,
  isQualifierPosition, // restrict based on policyDefinition
  */
  drawPositionInitialRounds,
  tournamentParticipants,
  positionAssignments,
  returnParticipants,
  appliedPolicies,
  drawDefinition,
  drawPosition,
  structureId,
  drawId,
}) {
  const qualifyingParticipants: HydratedParticipant[] = [];
  const qualifyingParticipantIds: string[] = [];
  const validAssignmentActions: any[] = [];
  const sourceStructureIds: string[] = [];

  const assignedParticipantIds = positionAssignments
    .map((assignment) => assignment.participantId)
    .filter(Boolean);

  const policy = appliedPolicies?.[POLICY_TYPE_POSITION_ACTIONS];

  // get the round number in which the drawPosition initially occurs
  const targetRoundNumber =
    !policy?.disableRoundRestrictions &&
    drawPositionInitialRounds[drawPosition];

  // disallow placing qualifiers until source structure is completed
  const requireCompletedStructures = policy?.requireCompletedStructures;

  const {
    sourceStructureIds: eliminationSoureStructureIds,
    relevantLinks: eliminationSourceLinks,
  } =
    getSourceStructureIdsAndRelevantLinks({
      targetRoundNumber, // look for soure structrues targeting roundNumber
      linkType: WINNER, // WINNER of qualifying structures will traverse link
      drawDefinition,
      structureId,
    }) || {};
  if (eliminationSoureStructureIds?.length)
    sourceStructureIds.push(...eliminationSoureStructureIds);

  const {
    sourceStructureIds: roundRobinSourceStructureIds,
    relevantLinks: roundRobinSourceLinks,
  } =
    getSourceStructureIdsAndRelevantLinks({
      targetRoundNumber, // look for soure structrues targeting roundNumber
      linkType: POSITION, // link will define how many finishingPositions traverse the link
      drawDefinition,
      structureId,
    }) || {};
  if (roundRobinSourceStructureIds?.length)
    sourceStructureIds.push(...roundRobinSourceStructureIds);

  for (const sourceLink of eliminationSourceLinks) {
    const structure = drawDefinition.structures?.find(
      (structure) => structure.structureId === sourceLink.source.structureId
    );
    if (structure?.stage !== QUALIFYING) continue;

    const structureCompleted = isCompletedStructure({
      structureId: sourceLink.source.structureId,
      drawDefinition,
    });

    if (!requireCompletedStructures || structureCompleted) {
      const qualifyingRoundNumber = structure.qualifyingRoundNumber;
      const { matchUps } = getAllStructureMatchUps({
        matchUpFilters: {
          roundNumbers: [qualifyingRoundNumber],
          hasWinningSide: true,
        },
        afterRecoveryTimes: false,
        tournamentParticipants,
        inContext: true,
        structure,
      });

      for (const matchUp of matchUps) {
        const winningSide = matchUp.sides.find(
          (side) => side?.sideNumber === matchUp.winningSide
        );
        const relevantSide =
          matchUp.matchUpStatus === BYE &&
          matchUp.sides?.find(({ participantId }) => participantId);

        if (winningSide || relevantSide) {
          const { participantId, participant } =
            winningSide || relevantSide || {};
          if (
            participantId &&
            !assignedParticipantIds.includes(participantId)
          ) {
            if (participant && returnParticipants)
              qualifyingParticipants.push(participant);
            qualifyingParticipantIds.push(participantId);
          }
        }
      }
    }
  }

  for (const sourceLink of roundRobinSourceLinks) {
    const structure = drawDefinition.structures?.find(
      (structure) => structure.structureId === sourceLink.source.structureId
    );
    if (structure?.stage !== QUALIFYING) continue;

    const structureCompleted = isCompletedStructure({
      structureId: sourceLink.source.structureId,
      drawDefinition,
    });

    if (!requireCompletedStructures || structureCompleted) {
      const { positionAssignments } = getPositionAssignments({ structure });
      const relevantParticipantIds: any =
        positionAssignments
          ?.map((assignment) => {
            const participantId = assignment.participantId;
            const results = findExtension({
              element: assignment,
              name: TALLY,
            }).extension?.value;

            return results
              ? { participantId, groupOrder: results?.groupOrder }
              : {};
          })
          .filter(
            ({ groupOrder, participantId }) =>
              // TODO: is this limiting RR qualifiers to groupOrder: 1?
              groupOrder === 1 &&
              !assignedParticipantIds.includes(participantId)
          )
          .map(({ participantId }) => participantId) ?? [];

      if (relevantParticipantIds)
        qualifyingParticipantIds.push(...relevantParticipantIds);

      if (returnParticipants) {
        const relevantParticipants = tournamentParticipants.filter(
          ({ participantId }) => relevantParticipantIds.includes(participantId)
        );
        qualifyingParticipants.push(...relevantParticipants);
      }
    }
  }

  // this should be "if qualifiers are available"
  if (qualifyingParticipantIds.length) {
    validAssignmentActions.push(
      definedAttributes({
        payload: {
          qualifyingParticipantId: undefined, // to be provided by client
          drawPosition,
          structureId,
          drawId,
        },
        method: QUALIFYING_PARTICIPANT_METHOD,
        type: QUALIFYING_PARTICIPANT,
        qualifyingParticipantIds,
        qualifyingParticipants: returnParticipants
          ? qualifyingParticipants
          : undefined,
      })
    );
  }

  return { validAssignmentActions, sourceStructureIds };
}

/**
  if (sourceStructureIds.length > 1)
    return decorateResult({
      stack: 'getValidQualifiersSaction',
      info: 'too many source structures',
      result: { error: INVALID_VALUES },
      context: { sourceStructureIds },
    });
  */

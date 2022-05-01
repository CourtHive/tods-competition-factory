import { getSourceStructureIdsAndRelevantLinks } from '../../../getters/getSourceStructureIdsAndRelevantLinks';
import { findExtension } from '../../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { getPositionAssignments } from '../../../getters/positionsGetter';
import { isCompletedStructure } from '../structureActions';

import { POLICY_TYPE_POSITION_ACTIONS } from '../../../../constants/policyConstants';
import { TALLY } from '../../../../constants/extensionConstants';
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
  policyDefinitions,
  drawDefinition,
  drawPosition,
  structureId,
  drawId,
}) {
  const qualifyingParticipantIds = [];
  const qualifyingParticipants = [];
  const validAssignmentActions = [];
  const sourceStructureIds = [];

  const assignedParticipantIds = positionAssignments
    .map((assignment) => assignment.participantId)
    .filter(Boolean);

  // get the round number in which the drawPosition initially occurs
  const targetRoundNumber = drawPositionInitialRounds[drawPosition];

  const policy = policyDefinitions?.[POLICY_TYPE_POSITION_ACTIONS];

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
        matchUpFilters: { roundNumbers: [qualifyingRoundNumber] },
        tournamentParticipants,
        hasWinningSide: true,
        inContext: true,
        structure,
      });

      for (const matchUp of matchUps) {
        const winningSide = matchUp.sides.find(
          (side) => side?.sideNumber === matchUp.winningSide
        );
        const { participantId, participant } = winningSide || {};
        if (participantId && !assignedParticipantIds.includes(participantId)) {
          if (participant) qualifyingParticipants.push(participant);
          qualifyingParticipantIds.push(participantId);
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
      const relevantParticipantIds = positionAssignments
        .map((assignment) => {
          const participantId = assignment.participantId;
          const results = findExtension({
            element: assignment,
            name: TALLY,
          }).extension?.value;

          return results
            ? { participantId, groupOrder: results?.groupOrder }
            : undefined;
        })
        .filter(
          ({ groupOrder, participantId }) =>
            groupOrder === 1 && !assignedParticipantIds.includes(participantId)
        )
        .map(({ participantId }) => participantId);

      qualifyingParticipantIds.push(...relevantParticipantIds);

      const relevantParticipants = tournamentParticipants.filter(
        ({ participantId }) => relevantParticipantIds.includes(participantId)
      );
      qualifyingParticipants.push(...relevantParticipants);
    }
  }

  // this should be "if qualifiers are available"
  if (qualifyingParticipantIds.length) {
    validAssignmentActions.push({
      payload: {
        qualifyingParticipantId: undefined, // to be provided by client
        drawPosition,
        structureId,
        drawId,
      },
      method: QUALIFYING_PARTICIPANT_METHOD,
      type: QUALIFYING_PARTICIPANT,
      qualifyingParticipantIds,
      qualifyingParticipants,
    });
  }

  return { validAssignmentActions };
}

/*
  if (sourceStructureIds.length > 1)
    return decorateResult({
      stack: 'getValidQualifiersSaction',
      info: 'too many source structures',
      result: { error: INVALID_VALUES },
      context: { sourceStructureIds },
    });
  */

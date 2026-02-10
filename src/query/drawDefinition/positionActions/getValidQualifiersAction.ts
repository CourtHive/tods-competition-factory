import { getSourceStructureIdsAndRelevantLinks } from '@Query/structure/getSourceStructureIdsAndRelevantLinks';
import { getAllStructureMatchUps } from '@Query/matchUps/getAllStructureMatchUps';
import { getPositionAssignments } from '@Query/drawDefinition/positionsGetter';
import { isCompletedStructure } from '@Query/drawDefinition/structureActions';
import { definedAttributes } from '@Tools/definedAttributes';
import { findExtension } from '@Acquire/findExtension';

// constants and types
import { QUALIFYING_PARTICIPANT, QUALIFYING_PARTICIPANT_METHOD } from '@Constants/positionActionConstants';
import { POSITION, QUALIFYING, WINNER } from '@Constants/drawDefinitionConstants';
import { POLICY_TYPE_POSITION_ACTIONS } from '@Constants/policyConstants';
import { BYE } from '@Constants/matchUpStatusConstants';
import { TALLY } from '@Constants/extensionConstants';
import { HydratedParticipant } from '@Types/hydrated';

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

  const assignedParticipantIds = new Set(
    positionAssignments.map((assignment) => assignment.participantId).filter(Boolean),
  );

  const policy = appliedPolicies?.[POLICY_TYPE_POSITION_ACTIONS];

  // get the round number in which the drawPosition initially occurs
  const targetRoundNumber = !policy?.disableRoundRestrictions && drawPositionInitialRounds[drawPosition];

  // disallow placing qualifiers until source structure is completed
  const requireCompletedStructures = policy?.requireCompletedStructures;

  const { sourceStructureIds: eliminationSoureStructureIds, relevantLinks: eliminationSourceLinks } =
    getSourceStructureIdsAndRelevantLinks({
      targetRoundNumber, // look for soure structrues targeting roundNumber
      linkType: WINNER, // WINNER of qualifying structures will traverse link
      drawDefinition,
      structureId,
    }) || {};
  if (eliminationSoureStructureIds?.length) sourceStructureIds.push(...eliminationSoureStructureIds);

  const { sourceStructureIds: roundRobinSourceStructureIds, relevantLinks: roundRobinSourceLinks } =
    getSourceStructureIdsAndRelevantLinks({
      targetRoundNumber, // look for soure structrues targeting roundNumber
      linkType: POSITION, // link will define how many finishingPositions traverse the link
      drawDefinition,
      structureId,
    }) || {};
  if (roundRobinSourceStructureIds?.length) sourceStructureIds.push(...roundRobinSourceStructureIds);

  for (const sourceLink of eliminationSourceLinks) {
    const structure = drawDefinition.structures?.find(
      (structure) => structure.structureId === sourceLink.source.structureId,
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
          isCollectionMatchUp: false,
          hasWinningSide: true,
        },
        afterRecoveryTimes: false,
        tournamentParticipants,
        inContext: true,
        structure,
      });

      for (const matchUp of matchUps) {
        const winningSide = matchUp.sides.find((side) => side?.sideNumber === matchUp.winningSide);
        const relevantSide = matchUp.matchUpStatus === BYE && matchUp.sides?.find(({ participantId }) => participantId);

        if (winningSide || relevantSide) {
          const { participantId, participant } = winningSide || relevantSide || {};
          if (participantId && !assignedParticipantIds.has(participantId)) {
            if (participant && returnParticipants) qualifyingParticipants.push(participant);
            qualifyingParticipantIds.push(participantId);
          }
        }
      }
    }
  }

  for (const sourceLink of roundRobinSourceLinks) {
    const structure = drawDefinition.structures?.find(
      (structure) => structure.structureId === sourceLink.source.structureId,
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

            return results ? { participantId, groupOrder: results?.groupOrder } : {};
          })
          .filter(({ groupOrder, participantId }) => groupOrder === 1 && !assignedParticipantIds.has(participantId))
          .map(({ participantId }) => participantId) ?? [];

      if (relevantParticipantIds) qualifyingParticipantIds.push(...relevantParticipantIds);

      if (returnParticipants) {
        const relevantParticipants = tournamentParticipants.filter(({ participantId }) =>
          relevantParticipantIds.includes(participantId),
        );
        qualifyingParticipants.push(...relevantParticipants);
      }
    }
  }

  if (qualifyingParticipantIds.length) {
    validAssignmentActions.push(
      definedAttributes({
        qualifyingParticipants: returnParticipants ? qualifyingParticipants : undefined,
        method: QUALIFYING_PARTICIPANT_METHOD,
        type: QUALIFYING_PARTICIPANT,
        qualifyingParticipantIds,
        payload: {
          qualifyingParticipantId: undefined, // to be provided by client
          drawPosition,
          structureId,
          drawId,
        },
      }),
    );
  }

  return { validAssignmentActions, sourceStructureIds };
}

import { findDrawDefinition } from '@Acquire/findDrawDefinition';
import { findEvent } from '@Acquire/findEvent';
import { findExtension } from '@Acquire/findExtension';
import { findStructure } from '@Acquire/findStructure';
import { qualifierDrawPositionAssignment } from '@Assemblies/governors/drawsGovernor';
import { POSITION, QUALIFYING, WINNER } from '@Constants/drawDefinitionConstants';
import { TALLY } from '@Constants/extensionConstants';
import { BYE } from '@Constants/matchUpStatusConstants';
import { POLICY_TYPE_POSITION_ACTIONS } from '@Constants/policyConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { decorateResult } from '@Functions/global/decorateResult';
import { getPositionAssignments, structureAssignedDrawPositions } from '@Query/drawDefinition/positionsGetter';
import { isCompletedStructure } from '@Query/drawDefinition/structureActions';
import { getAppliedPolicies } from '@Query/extensions/getAppliedPolicies';
import { getAllStructureMatchUps } from '@Query/matchUps/getAllStructureMatchUps';
import { getSourceStructureIdsAndRelevantLinks } from '@Query/structure/getSourceStructureIdsAndRelevantLinks';
import { randomPop } from '@Tools/arrays';
import { definedAttributes } from '@Tools/definedAttributes';
import { ResultType } from '@Types/factoryTypes';
import { DrawDefinition, Event, Structure, Tournament } from '@Types/tournamentTypes';

interface QualifierProgressionArgs {
  drawId: string;
  eventId: string;
  mainStructureId: string;
  tournamentRecord: Tournament;
}

export function qualifierProgression({
  drawId,
  eventId,
  mainStructureId,
  tournamentRecord,
}: QualifierProgressionArgs): ResultType {
  const qualifyingParticipantIds: string[] = [];

  const drawDefinition = findDrawDefinition({ tournamentRecord, drawId })?.drawDefinition ?? ({} as DrawDefinition);
  const event = findEvent({ tournamentRecord, eventId })?.event ?? ({} as Event);
  const structure = findStructure({ drawDefinition, structureId: mainStructureId })?.structure ?? ({} as Structure);

  const appliedPolicies =
    getAppliedPolicies({
      tournamentRecord,
      drawDefinition,
      structure,
      event,
    }).appliedPolicies ?? {};

  const policy = appliedPolicies[POLICY_TYPE_POSITION_ACTIONS];
  const requireCompletedStructures = policy?.requireCompletedStructures;

  const { qualifierPositions, positionAssignments } = structureAssignedDrawPositions({ structure });

  if (!qualifierPositions.length) return decorateResult({ result: { error: 'NO_QUALIFIER_POSITIONS' } }); // update with error constant

  const assignedParticipantIds = positionAssignments.map((assignment) => assignment.participantId).filter(Boolean);

  const { relevantLinks: eliminationSourceLinks } =
    getSourceStructureIdsAndRelevantLinks({
      linkType: WINNER, // WINNER of qualifying structures will traverse link
      drawDefinition,
      structureId: structure.structureId,
    }) || {};

  const { relevantLinks: roundRobinSourceLinks } =
    getSourceStructureIdsAndRelevantLinks({
      linkType: POSITION, // link will define how many finishingPositions traverse the link
      drawDefinition,
      structureId: structure.structureId,
    }) || {};

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
          ...(qualifyingRoundNumber && {
            roundNumbers: [qualifyingRoundNumber],
          }),
          hasWinningSide: true,
        },
        afterRecoveryTimes: false,
        inContext: true,
        structure,
      });

      for (const matchUp of matchUps) {
        const winningSide = matchUp.sides.find((side) => side?.sideNumber === matchUp.winningSide);
        const relevantSide = matchUp.matchUpStatus === BYE && matchUp.sides?.find(({ participantId }) => participantId);

        if (winningSide || relevantSide) {
          const { participantId } = winningSide || relevantSide || {};
          if (participantId && !assignedParticipantIds.includes(participantId)) {
            qualifyingParticipantIds.push(participantId);
          }
        }
      }
    }
  }

  for (const sourceLink of roundRobinSourceLinks) {
    const structure = drawDefinition?.structures?.find(
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
          .filter(
            ({ groupOrder, participantId }) => groupOrder === 1 && !assignedParticipantIds.includes(participantId),
          )
          .map(({ participantId }) => participantId) ?? [];

      if (relevantParticipantIds) qualifyingParticipantIds.push(...relevantParticipantIds);
    }
  }

  if (!qualifyingParticipantIds.length) return decorateResult({ result: { error: 'NO_QUALIFIERS_FOUND' } }); // update with error constant

  qualifierPositions.forEach((position) => {
    const randomParticipantId = randomPop(qualifyingParticipantIds);
    randomParticipantId &&
      qualifierDrawPositionAssignment({
        qualifyingParticipantId: randomParticipantId,
        tournamentRecord,
        drawDefinition,
        drawPosition: position.drawPosition,
        structureId: structure.structureId,
      });
  });

  return decorateResult({
    result: definedAttributes({
      ...SUCCESS,
    }),
  });
}

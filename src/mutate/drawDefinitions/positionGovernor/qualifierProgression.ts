import { findExtension } from '@Acquire/findExtension';
import { qualifierDrawPositionAssignment } from '@Assemblies/governors/drawsGovernor';
import { DRAW_DEFINITION, EVENT, TOURNAMENT_RECORD } from '@Constants/attributeConstants';
import { MAIN, POSITION, QUALIFYING, WINNER } from '@Constants/drawDefinitionConstants';
import {
  MISSING_MAIN_STRUCTURE,
  MISSING_QUALIFIED_PARTICIPANTS,
  NO_DRAW_POSITIONS_AVAILABLE_FOR_QUALIFIERS,
} from '@Constants/errorConditionConstants';
import { TALLY } from '@Constants/extensionConstants';
import { BYE } from '@Constants/matchUpStatusConstants';
import { POLICY_TYPE_POSITION_ACTIONS } from '@Constants/policyConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { decorateResult } from '@Functions/global/decorateResult';
import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { getPositionAssignments, structureAssignedDrawPositions } from '@Query/drawDefinition/positionsGetter';
import { isCompletedStructure } from '@Query/drawDefinition/structureActions';
import { getAppliedPolicies } from '@Query/extensions/getAppliedPolicies';
import { getAllStructureMatchUps } from '@Query/matchUps/getAllStructureMatchUps';
import { getSourceStructureIdsAndRelevantLinks } from '@Query/structure/getSourceStructureIdsAndRelevantLinks';
import { randomPop } from '@Tools/arrays';
import { definedAttributes } from '@Tools/definedAttributes';
import { ResultType } from '@Types/factoryTypes';
import { DrawDefinition, Event, Tournament } from '@Types/tournamentTypes';

interface QualifierProgressionArgs {
  drawDefinition: DrawDefinition;
  event: Event;
  targetRoundNumber?: number;
  tournamentRecord: Tournament;
}

export function qualifierProgression({
  drawDefinition,
  event,
  targetRoundNumber = 1,
  tournamentRecord,
}: QualifierProgressionArgs): ResultType {
  const paramsCheck = checkRequiredParameters(
    {
      drawDefinition,
      event,
      tournamentRecord,
    },
    [{ [DRAW_DEFINITION]: true, [EVENT]: true, [TOURNAMENT_RECORD]: true }],
  );
  if (paramsCheck.error) return paramsCheck;

  const qualifyingParticipantIds: string[] = [];
  const assignedParticipants: {
    participantId: string;
    drawPosition: number;
  }[] = [];

  const mainStructure = drawDefinition.structures?.find(
    (structure) => structure.stage === MAIN && structure.stageSequence === 1,
  );

  if (!mainStructure) return decorateResult({ result: { error: MISSING_MAIN_STRUCTURE } });

  const appliedPolicies =
    getAppliedPolicies({
      tournamentRecord,
      drawDefinition,
      structure: mainStructure,
      event,
    }).appliedPolicies ?? {};

  const policy = appliedPolicies[POLICY_TYPE_POSITION_ACTIONS];
  const requireCompletedStructures = policy?.requireCompletedStructures;

  const { qualifierPositions, positionAssignments } = structureAssignedDrawPositions({ structure: mainStructure });

  if (!qualifierPositions.length)
    return decorateResult({ result: { error: NO_DRAW_POSITIONS_AVAILABLE_FOR_QUALIFIERS } });

  const assignedParticipantIds = positionAssignments.map((assignment) => assignment.participantId).filter(Boolean);

  const { relevantLinks: eliminationSourceLinks } =
    getSourceStructureIdsAndRelevantLinks({
      targetRoundNumber,
      linkType: WINNER, // WINNER of qualifying structures will traverse link
      drawDefinition,
      structureId: mainStructure.structureId,
    }) || {};

  const { relevantLinks: roundRobinSourceLinks } =
    getSourceStructureIdsAndRelevantLinks({
      targetRoundNumber,
      linkType: POSITION, // link will define how many finishingPositions traverse the link
      drawDefinition,
      structureId: mainStructure.structureId,
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

    if (structureCompleted) {
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

  if (!qualifyingParticipantIds.length) return decorateResult({ result: { error: MISSING_QUALIFIED_PARTICIPANTS } });

  qualifierPositions.forEach((position) => {
    const randomParticipantId = randomPop(qualifyingParticipantIds);

    if (randomParticipantId) {
      const positionAssignmentResult: ResultType = qualifierDrawPositionAssignment({
        qualifyingParticipantId: randomParticipantId,
        tournamentRecord,
        drawDefinition,
        drawPosition: position.drawPosition,
        structureId: mainStructure.structureId,
      });

      positionAssignmentResult?.success &&
        assignedParticipants.push({ participantId: randomParticipantId, drawPosition: position.drawPosition });
    }
  });

  return decorateResult({
    result: definedAttributes({
      ...SUCCESS,
      assignedParticipants,
    }),
  });
}

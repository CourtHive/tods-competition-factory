import { checkFormatScopeEquivalence } from './checkFormatScopeEquivalence';
import { policyAttachment } from './drawDefinitionPolicyAttachment';
import { newDrawDefinition } from '../newDrawDefinition';

import { ResultType, decorateResult } from '../../../../functions/global/decorateResult';
import { DrawDefinition, DrawTypeUnion } from '../../../../types/tournamentTypes';
import { MAIN, QUALIFYING } from '../../../../constants/drawDefinitionConstants';

export function setUpDrawGeneration(params): ResultType & {
  existingQualifyingPlaceholderStructureId?: string | boolean;
  existingDrawDefinition?: DrawDefinition;
  drawDefinition?: DrawDefinition;
  structureId?: string;
} {
  const {
    tournamentRecord,
    matchUpFormat,
    appliedPolicies,
    policyDefinitions,
    matchUpType,
    tieFormat,
    drawType,
    stack,
    event,
  } = params;

  const existingDrawDefinition = params.drawId
    ? (event?.drawDefinitions?.find((d) => d.drawId === params.drawId) as DrawDefinition)
    : undefined;

  if (existingDrawDefinition && drawType !== existingDrawDefinition.drawType)
    existingDrawDefinition.drawType = drawType as DrawTypeUnion;

  const drawDefinition: any =
    existingDrawDefinition ??
    newDrawDefinition({
      processCodes: params.processCodes,
      drawId: params.drawId,
      drawType,
    });

  const equivalenceResult = checkFormatScopeEquivalence({
    tournamentRecord,
    drawDefinition,
    matchUpFormat,
    matchUpType,
    tieFormat,
    event,
  });
  if (equivalenceResult.error) return decorateResult({ result: equivalenceResult, stack });

  const attachmentResult = policyAttachment({ appliedPolicies, policyDefinitions, drawDefinition, stack });
  if (attachmentResult.error) return attachmentResult;

  // find existing MAIN structureId if existingDrawDefinition
  const structureId = existingDrawDefinition?.structures?.find(
    (structure) => structure.stage === MAIN && structure.stageSequence === 1,
  )?.structureId;

  const existingQualifyingStructures = existingDrawDefinition
    ? existingDrawDefinition.structures?.filter((structure) => structure.stage === QUALIFYING)
    : [];
  const existingQualifyingPlaceholderStructureId =
    existingQualifyingStructures?.length === 1 &&
    !existingQualifyingStructures[0].matchUps?.length &&
    existingQualifyingStructures[0].structureId;

  return { drawDefinition, structureId, existingDrawDefinition, existingQualifyingPlaceholderStructureId };
}

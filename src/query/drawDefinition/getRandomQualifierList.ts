import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { DrawDefinition } from '@Types/tournamentTypes';
import { DRAW_DEFINITION } from '@Constants/attributeConstants';
import { MAIN } from '@Constants/drawDefinitionConstants';
import { decorateResult } from '@Functions/global/decorateResult';
import { MISSING_MAIN_STRUCTURE } from '@Constants/errorConditionConstants';
import { structureAssignedDrawPositions } from '@Query/drawDefinition/positionsGetter';

interface GetRandomQualifierListParams {
  drawDefinition: DrawDefinition;
}

export const getRandomQualifierList = ({ drawDefinition }: GetRandomQualifierListParams) => {
  const paramsCheck = checkRequiredParameters({ drawDefinition }, [{ [DRAW_DEFINITION]: true }]);

  if (paramsCheck.error) return paramsCheck;

  const mainStructure = drawDefinition.structures?.find(
    (structure) => structure.stage === MAIN && structure.stageSequence === 1,
  );

  if (!mainStructure) return decorateResult({ result: { error: MISSING_MAIN_STRUCTURE } });

  const {
    qualifierPositions,
  }: {
    qualifierPositions: { drawPosition: number; qualifier: boolean }[];
  } = structureAssignedDrawPositions({ structure: mainStructure });

  return qualifierPositions.map((position) => position.drawPosition).sort(() => Math.random() - 0.5);
};

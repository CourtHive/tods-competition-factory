import { DrawDefinition, Structure } from '../../../types/tournamentFromSchema';
import { AD_HOC } from '../../../constants/drawDefinitionConstants';

type IsAdHocArgs = {
  drawDefinition?: DrawDefinition;
  structure?: Structure;
};
export function isAdHoc({ drawDefinition, structure }: IsAdHocArgs): boolean {
  if (!structure) return false;

  const hasRoundPosition = structure?.matchUps?.find(
    (matchUp) => matchUp?.roundPosition
  );
  const hasDrawPosition = structure?.matchUps?.find(
    (matchUp) => matchUp?.drawPositions?.length
  );

  return (
    !structure?.structures &&
    !(drawDefinition?.drawType && drawDefinition.drawType !== AD_HOC) &&
    !hasRoundPosition &&
    !hasDrawPosition
  );
}

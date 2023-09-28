import { DrawDefinition } from '../../../types/tournamentFromSchema';
import { AD_HOC } from '../../../constants/drawDefinitionConstants';

type IsAdHocArgs = {
  drawDefinition?: DrawDefinition;
  structure?: any; // in this case support hydrated structures as well
};
export function isAdHoc({ drawDefinition, structure }: IsAdHocArgs): boolean {
  if (!structure) return false;

  const matchUps =
    structure.matchUps ||
    (structure.roundMatchUps && Object.values(structure.roundMatchUps).flat());

  const hasRoundPosition = matchUps?.find((matchUp) => matchUp?.roundPosition);
  const hasDrawPosition = matchUps?.find(
    (matchUp) => matchUp?.drawPositions?.length
  );

  return (
    !structure?.structures &&
    !(drawDefinition?.drawType && drawDefinition.drawType !== AD_HOC) &&
    !hasRoundPosition &&
    !hasDrawPosition
  );
}

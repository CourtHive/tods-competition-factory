import { VOLUNTARY_CONSOLATION } from '@Constants/drawDefinitionConstants';

type IsAdHocArgs = {
  structure?: any; // in this case support hydrated structures as well
};
export function isAdHoc({ structure }: IsAdHocArgs): boolean {
  if (!structure) return false;

  const matchUps = structure.matchUps || (structure.roundMatchUps && Object.values(structure.roundMatchUps).flat());

  const hasRoundPosition = !!matchUps?.find((matchUp) => matchUp?.roundPosition);
  const hasDrawPosition = !!matchUps?.find((matchUp) => matchUp?.drawPositions?.length);

  const adHoc =
    !structure?.structures &&
    structure?.stage !== VOLUNTARY_CONSOLATION &&
    // !(drawDefinition?.drawType && drawDefinition.drawType !== AD_HOC) &&
    (!matchUps.length || (!hasRoundPosition && !hasDrawPosition));

  return adHoc;
}

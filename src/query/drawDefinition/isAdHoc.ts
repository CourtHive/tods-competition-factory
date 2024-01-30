import { VOLUNTARY_CONSOLATION } from '@Constants/drawDefinitionConstants';

type IsAdHocArgs = {
  structure?: any; // in this case support hydrated structures as well
};
export function isAdHoc({ structure }: IsAdHocArgs): boolean {
  if (!structure) return false;

  const matchUps = structure.matchUps || (structure.roundMatchUps && Object.values(structure.roundMatchUps).flat());

  const hasRoundPosition = !!matchUps?.find((matchUp) => matchUp?.roundPosition);
  const hasDrawPosition = !!matchUps?.find((matchUp) => matchUp?.drawPositions?.length);

  return (
    !structure?.structures &&
    structure?.stage !== VOLUNTARY_CONSOLATION &&
    (!matchUps.length || (!hasRoundPosition && !hasDrawPosition))
  );
}

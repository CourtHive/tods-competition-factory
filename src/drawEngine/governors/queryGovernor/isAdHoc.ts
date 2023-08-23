import { AD_HOC } from '../../../constants/drawDefinitionConstants';
import { DrawDefinition, Structure } from '../../../types/tournamentFromSchema';

type IsAdHocArgs = {
  drawDefinition?: DrawDefinition;
  structure?: Structure;
};
export function isAdHoc({ drawDefinition, structure }: IsAdHocArgs): boolean {
  if (!structure) return false;

  return (
    !structure?.structures &&
    !(drawDefinition?.drawType && drawDefinition.drawType !== AD_HOC) &&
    !structure?.matchUps?.find(({ roundPosition }) => !!roundPosition)
  );
}

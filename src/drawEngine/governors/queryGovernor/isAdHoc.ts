import { AD_HOC } from '../../../constants/drawDefinitionConstants';

export function isAdHoc({ drawDefinition, structure }) {
  if (!structure) return false;

  return (
    !structure?.structures &&
    !(drawDefinition?.drawType && drawDefinition.drawType !== AD_HOC) &&
    !structure?.matchUps?.find(({ roundPosition }) => !!roundPosition)
  );
}

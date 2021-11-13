import { AD_HOC } from '../../../constants/drawDefinitionConstants';

export function isAdHoc({ drawDefinition, structure }) {
  return (
    !structure?.structures &&
    !(drawDefinition?.drawType && drawDefinition.drawType !== AD_HOC) &&
    !structure?.matchUps.find(({ roundPosition }) => !!roundPosition)
  );
}

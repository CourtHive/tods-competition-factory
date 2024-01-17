import definitionTemplate from '../templates/drawDefinitionTemplate';
import { UUID } from '../../../tools/UUID';

type NewDrawDefinitionArgs = {
  processCodes?: string[];
  matchUpType?: string;
  drawType?: string;
  drawId?: string;
};
export function newDrawDefinition(params?: NewDrawDefinitionArgs) {
  const { drawId = UUID(), processCodes, matchUpType, drawType } = params ?? {};
  const drawDefinition = definitionTemplate();
  return Object.assign(drawDefinition, {
    processCodes,
    matchUpType,
    drawType,
    drawId,
  });
}

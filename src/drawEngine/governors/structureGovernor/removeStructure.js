import {
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
} from '../../../constants/errorConditionConstants';

export function removeStructure({ drawDefinition, structureId }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };
  return { error: 'not implemented' };
}

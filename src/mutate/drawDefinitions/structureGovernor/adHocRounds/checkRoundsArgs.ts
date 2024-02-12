import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { isAdHoc } from '@Query/drawDefinition/isAdHoc';
import { findStructure } from '@Acquire/findStructure';

// constants
import { INVALID_STRUCTURE } from '@Constants/errorConditionConstants';

export function checkRoundsArgs(params) {
  const paramsCheck = checkRequiredParameters(params, [{ drawDefinition: true, structureId: true }]);
  if (paramsCheck.error) return paramsCheck;

  const result = findStructure(params);
  if (result.error) return result;

  const structure = result.structure;
  const structureIsAdHoc = isAdHoc({ structure });
  if (!structureIsAdHoc) return { error: INVALID_STRUCTURE, message: 'structure must be adHoc' };

  return { valid: true };
}

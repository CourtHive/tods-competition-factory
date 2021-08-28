import { getAllDrawMatchUps } from './getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from './getters/getMatchUps/getMatchUpsMap';
import { makeDeepCopy } from '../utilities';
import definitionTemplate, {
  keyValidation,
} from './generators/drawDefinitionTemplate';

import {
  INVALID_OBJECT,
  MISSING_DRAW_ID,
  INVALID_DRAW_DEFINITION,
  MISSING_DRAW_DEFINITION,
} from '../constants/errorConditionConstants';

// TASK: add verify/validate structure as option in setState
export function setState(definition, deepCopyOption = true) {
  if (!definition) return { error: MISSING_DRAW_DEFINITION };
  if (typeof definition !== 'object') return { error: INVALID_OBJECT };
  if (!definition.drawId) return { error: MISSING_DRAW_ID, method: 'setState' };

  if (!validDefinitionKeys(definition))
    return { error: INVALID_DRAW_DEFINITION };

  return deepCopyOption ? makeDeepCopy(definition) : definition;
}

function validDefinitionKeys(definition) {
  const definitionKeys = Object.keys(definition);
  const valid = keyValidation.reduce(
    (p, key) => (!definitionKeys.includes(key) ? false : p),
    true
  );
  return valid;
}

export function newDrawDefinition({ drawId, drawType } = {}) {
  const drawDefinition = definitionTemplate();
  return Object.assign(drawDefinition, { drawId, drawType });
}

export function paramsMiddleWare(drawDefinition) {
  const matchUpsMap = getMatchUpsMap({ drawDefinition });

  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    drawDefinition,
    inContext: true,
    includeByeMatchUps: true,

    matchUpsMap,
  });

  const additionalParams = {
    matchUpsMap,
    inContextDrawMatchUps,
  };

  return additionalParams;
}

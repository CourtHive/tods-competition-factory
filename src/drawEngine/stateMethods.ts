import { getAllDrawMatchUps } from './getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from './getters/getMatchUps/getMatchUpsMap';
import { makeDeepCopy, UUID } from '../utilities';
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
  return keyValidation.reduce(
    (p, key) => (!definitionKeys.includes(key) ? false : p),
    true
  );
}

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

export function paramsMiddleware(drawDefinition) {
  const matchUpsMap = getMatchUpsMap({ drawDefinition });

  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    inContext: true,
    drawDefinition,
    matchUpsMap,
  });

  return {
    inContextDrawMatchUps,
    matchUpsMap,
  };
}

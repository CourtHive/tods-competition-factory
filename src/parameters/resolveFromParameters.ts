import { findMatchUp } from '../tournamentEngine/getters/matchUpsGetter/findMatchUp';
import { isObject, isString } from '../utilities/objects';

import {
  INVALID_VALUES,
  NOT_FOUND,
} from '../constants/errorConditionConstants';

type Params = { [key: string]: any };
type ParamsToResolve = {
  attr: { [key: string]: any }; // passed into resolution function
  validate?: any;
  param: string;
  type?: string;
}[];

export function resolveFromParameters(
  params: Params,
  paramsToResolve: ParamsToResolve
) {
  if (!isObject(params)) return { error: INVALID_VALUES };
  if (!Array.isArray(paramsToResolve)) return { error: INVALID_VALUES };

  const resolutions: any = {};
  for (const { param, attr } of paramsToResolve) {
    const resolution = findResolution({ params, param, attr });
    if (resolution?.error) return resolution;
    resolutions[param] = resolution;
  }

  return resolutions;
}

function findResolution({ params, param, attr }) {
  if (
    param === 'structure' &&
    isObject(params.drawDefinition) &&
    isString(params.structureId)
  ) {
    return (params.drawDefinition.structures ?? []).find(
      ({ structureId }) => structureId === params.structureId
    );
  }

  if (
    param === 'matchUp' &&
    isObject(params.tournamentRecord) &&
    isObject(params.drawDefinition)
  ) {
    const result = findMatchUp({
      ...params,
      ...attr,
    });
    return result.error ? result : result.matchUp;
  }

  return { error: NOT_FOUND, info: { param } };
}

import { isFunction, isObject } from '../utilities/objects';
import { intersection } from '../utilities';

import {
  EVENT_NOT_FOUND,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_DRAW_ID,
  MISSING_EVENT,
  MISSING_MATCHUP,
  MISSING_MATCHUPS,
  MISSING_MATCHUP_ID,
  MISSING_MATCHUP_IDS,
  MISSING_PARTICIPANT_ID,
  MISSING_POLICY_DEFINITION,
  MISSING_STRUCTURE,
  MISSING_STRUCTURES,
  MISSING_STRUCTURE_ID,
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
} from '../constants/errorConditionConstants';

type Params = { [key: string]: any };
type RequiredParams = {
  _anyOf?: { [key: string]: boolean };
  _oneOf?: { [key: string]: boolean };
  [key: string]: any;
  _oftype?: string;
  validate?: any;
  resolve?: any;
}[];

const errors = {
  tournamentRecords: MISSING_TOURNAMENT_RECORDS,
  tournamentRecord: MISSING_TOURNAMENT_RECORD,
  policyDefinitions: MISSING_POLICY_DEFINITION,
  drawDefinition: MISSING_DRAW_DEFINITION,
  participantId: MISSING_PARTICIPANT_ID,
  tournamentId: MISSING_TOURNAMENT_ID,
  structureId: MISSING_STRUCTURE_ID,
  matchUpIds: MISSING_MATCHUP_IDS,
  structures: MISSING_STRUCTURES,
  matchUpId: MISSING_MATCHUP_ID,
  structure: MISSING_STRUCTURE,
  matchUps: MISSING_MATCHUPS,
  matchUp: MISSING_MATCHUP,
  drawId: MISSING_DRAW_ID,
  eventId: MISSING_EVENT,
  event: EVENT_NOT_FOUND,
};

const paramTypes = {
  tournamentRecords: 'object',
  tournamentRecord: 'object',
  policyDefinitions: 'object',
  drawDefinition: 'object',
  matchUpIds: 'array',
  structures: 'array',
  structure: 'object',
  matchUps: 'array',
  matchUp: 'object',
  event: 'object',
};

export function checkRequiredParameters(
  params: Params,
  requiredParams: RequiredParams
) {
  if (!params && !isObject(params)) return { error: INVALID_VALUES };
  if (!requiredParams?.length || params?._bypassParamCheck)
    return { valid: true };

  if (!Array.isArray(requiredParams)) return { error: INVALID_VALUES };

  const { paramError, errorParam } = findParamError(params, requiredParams);
  if (!paramError) return { valid: true };

  const error =
    params[errorParam] === undefined
      ? errors[errorParam] || INVALID_VALUES
      : (paramError.validate && paramError.invalid) || INVALID_VALUES;

  return { error, info: { param: errorParam } };
}

function getIntersection(params, constraint) {
  const paramKeys = Object.keys(params);
  const constraintKeys = Object.keys(constraint);
  return intersection(paramKeys, constraintKeys);
}

function getOneOf(params, _oneOf) {
  if (!_oneOf) return;
  const overlap = getIntersection(params, _oneOf);
  if (overlap.length !== 1) return { error: INVALID_VALUES };
  return overlap.reduce((attr, param) => ({ ...attr, [param]: true }), {});
}

function getAnyOf(params, _anyOf) {
  if (!_anyOf) return;
  const overlap = getIntersection(params, _anyOf);
  if (overlap.length < 1) return { error: INVALID_VALUES };
  return overlap.reduce((attr, param) => ({ ...attr, [param]: true }), {});
}

function findParamError(params, requiredParams) {
  let errorParam;
  const paramError = requiredParams.find(
    ({ _oftype, _oneOf, _anyOf, validate, ...attrs }) => {
      const oneOf = _oneOf && getOneOf(params, _oneOf);
      if (oneOf?.error) return oneOf.error;
      oneOf && Object.assign(attrs, oneOf);
      const anyOf = _anyOf && getAnyOf(params, _anyOf);
      if (anyOf?.error) return anyOf.error;
      anyOf && Object.assign(attrs, anyOf);

      const booleanParams = Object.keys(attrs).filter(
        (key) => typeof attrs[key] === 'boolean'
      );
      const invalidParam = booleanParams.find((param) => {
        const invalid =
          params[param] === undefined || invalidType(params, param, _oftype);
        const hasError =
          invalid || (validate && !checkValidation(params[param], validate));
        if (hasError) errorParam = param;
        return hasError;
      });
      return !booleanParams.length || invalidParam;
    }
  );
  return { paramError, errorParam };
}

function invalidType(params, param, _oftype) {
  _oftype = _oftype || paramTypes[param] || 'string';
  if (_oftype === 'array') return !Array.isArray(params[param]);
  return typeof params[param] !== _oftype;
}

function checkValidation(value, validate) {
  if (isFunction(validate)) return validate(value);
  return true;
}

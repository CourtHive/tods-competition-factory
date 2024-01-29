import { decorateResult } from '@Functions/global/decorateResult';
import { isFunction, isObject } from '@Tools/objects';
import { intersection } from '@Tools/arrays';

import { ResultType } from '@Types/factoryTypes';
import {
  EVENT_NOT_FOUND,
  INVALID_VALUES,
  MISSING_COURT_ID,
  MISSING_DRAW_DEFINITION,
  MISSING_DRAW_ID,
  MISSING_EVENT,
  MISSING_MATCHUP,
  MISSING_MATCHUPS,
  MISSING_MATCHUP_FORMAT,
  MISSING_MATCHUP_ID,
  MISSING_MATCHUP_IDS,
  MISSING_PARTICIPANT,
  MISSING_PARTICIPANT_ID,
  MISSING_POLICY_DEFINITION,
  MISSING_STRUCTURE,
  MISSING_STRUCTURES,
  MISSING_STRUCTURE_ID,
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '@Constants/errorConditionConstants';
import {
  ARRAY,
  COURT_ID,
  COURT_IDS,
  DRAW_DEFINITION,
  DRAW_ID,
  EVENT,
  EVENT_ID,
  MATCHUP,
  MATCHUPS,
  MATCHUP_FORMAT,
  MATCHUP_ID,
  MATCHUP_IDS,
  OBJECT,
  PARTICIPANT,
  PARTICIPANT_ID,
  POLICY_DEFINITIONS,
  SCHEDULE_DATES,
  STRUCTURE,
  STRUCTURES,
  STRUCTURE_ID,
  TOURNAMENT_ID,
  TOURNAMENT_RECORD,
  TOURNAMENT_RECORDS,
  UUIDS,
  VENUE_IDS,
} from '@Constants/attributeConstants';

type Params = { [key: string]: any };
type RequiredParams = {
  _anyOf?: { [key: string]: boolean };
  _oneOf?: { [key: string]: boolean };
  [key: string]: any;
  _ofType?: string;
  validate?: any;
  resolve?: any;
}[];

const errors = {
  [TOURNAMENT_RECORDS]: MISSING_TOURNAMENT_RECORDS,
  [TOURNAMENT_RECORD]: MISSING_TOURNAMENT_RECORD,
  [POLICY_DEFINITIONS]: MISSING_POLICY_DEFINITION,
  [DRAW_DEFINITION]: MISSING_DRAW_DEFINITION,
  [PARTICIPANT_ID]: MISSING_PARTICIPANT_ID,
  [MATCHUP_FORMAT]: MISSING_MATCHUP_FORMAT,
  [TOURNAMENT_ID]: MISSING_TOURNAMENT_ID,
  [STRUCTURE_ID]: MISSING_STRUCTURE_ID,
  [MATCHUP_IDS]: MISSING_MATCHUP_IDS,
  [PARTICIPANT]: MISSING_PARTICIPANT,
  [STRUCTURES]: MISSING_STRUCTURES,
  [MATCHUP_ID]: MISSING_MATCHUP_ID,
  [STRUCTURE]: MISSING_STRUCTURE,
  [COURT_ID]: MISSING_COURT_ID,
  [MATCHUPS]: MISSING_MATCHUPS,
  [MATCHUP]: MISSING_MATCHUP,
  [COURT_IDS]: MISSING_VALUE,
  [VENUE_IDS]: MISSING_VALUE,
  [DRAW_ID]: MISSING_DRAW_ID,
  [EVENT_ID]: MISSING_EVENT,
  [EVENT]: EVENT_NOT_FOUND,
};

const paramTypes = {
  [TOURNAMENT_RECORDS]: OBJECT,
  [POLICY_DEFINITIONS]: OBJECT,
  [TOURNAMENT_RECORD]: OBJECT,
  [DRAW_DEFINITION]: OBJECT,
  [SCHEDULE_DATES]: ARRAY,
  [PARTICIPANT]: OBJECT,
  [MATCHUP_IDS]: ARRAY,
  [STRUCTURES]: ARRAY,
  [STRUCTURE]: OBJECT,
  [COURT_IDS]: ARRAY,
  [VENUE_IDS]: ARRAY,
  [MATCHUPS]: ARRAY,
  [MATCHUP]: OBJECT,
  [EVENT]: OBJECT,
  [UUIDS]: ARRAY,
};

export function checkRequiredParameters(
  params: Params,
  requiredParams: RequiredParams,
  stack?: string,
): ResultType & {
  valid?: boolean;
} {
  if (!params && !isObject(params)) return { error: INVALID_VALUES };
  if (!requiredParams?.length || params?._bypassParamCheck) return { valid: true };

  if (!Array.isArray(requiredParams)) return { error: INVALID_VALUES };

  const { paramError, errorParam } = findParamError(params, requiredParams);
  if (!paramError) return { valid: true };

  const error =
    params[errorParam] === undefined
      ? errors[errorParam] || INVALID_VALUES
      : (paramError.validate && paramError.invalid) || INVALID_VALUES;

  return decorateResult({
    info: { param: errorParam },
    result: { error },
    stack,
  });
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
  const overlap = getIntersection(params, _anyOf).filter((param) => params[param]);
  if (overlap.length < 1) return { error: INVALID_VALUES };
  return overlap.reduce((attr, param) => ({ ...attr, [param]: true }), {});
}

function findParamError(params, requiredParams) {
  let errorParam;
  const paramError = requiredParams.find(({ _ofType, _oneOf, _anyOf, validate, ...attrs }) => {
    const oneOf = _oneOf && getOneOf(params, _oneOf);
    if (oneOf?.error) return oneOf.error;
    oneOf && Object.assign(attrs, oneOf);

    const anyOf = _anyOf && getAnyOf(params, _anyOf);
    if (anyOf?.error) return anyOf.error;
    anyOf && Object.assign(attrs, anyOf);

    const booleanParams = Object.keys(attrs).filter((key) => typeof attrs[key] === 'boolean');

    const invalidParam = booleanParams.find((param) => {
      const invalidValidationFunction = validate && !isFunction(validate); // validate is specified but not a function
      const faliedTypeCheck = params[param] && !validate && invalidType(params, param, _ofType); // param is present, no validation function provided, and invalid type
      const paramNotPresent = attrs[param] && !params[param]; // attrs[param] boolean value is true and param is not present
      const invalid = invalidValidationFunction || faliedTypeCheck || paramNotPresent;

      const hasError = invalid || (validate && params[param] && !checkValidation(params[param], validate));
      if (hasError) errorParam = param;

      return hasError;
    });

    return !booleanParams.length || invalidParam;
  });
  return { paramError, errorParam };
}

function invalidType(params, param, _ofType) {
  _ofType = _ofType || paramTypes[param] || 'string';
  if (_ofType === 'array') {
    return !Array.isArray(params[param]);
  }
  return typeof params[param] !== _ofType;
}

function checkValidation(value, validate) {
  if (isFunction(validate)) return validate(value);
  return true;
}

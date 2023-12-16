import { isFunction, isObject } from '../utilities/objects';

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
  MISSING_STRUCTURE,
  MISSING_STRUCTURES,
  MISSING_STRUCTURE_ID,
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
} from '../constants/errorConditionConstants';

type Params = { [key: string]: any };
type RequiredParams = {
  [key: string]: any;
  validate?: any;
  resolve?: any;
  type?: string;
}[];

const errors = {
  tournamentRecords: MISSING_TOURNAMENT_RECORDS,
  tournamentRecord: MISSING_TOURNAMENT_RECORD,
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

  const paramType = (key) => typeof params[key];
  const invalidType = (param, type) => {
    type = type || paramTypes[param] || 'string';
    if (type === 'array') return !Array.isArray(params[param]);
    return paramType(param) !== type;
  };

  let errorParam;
  const paramError = requiredParams.find(({ type, validate, ...attrs }) => {
    const booleanParams = Object.keys(attrs).filter(
      (key) => typeof attrs[key] === 'boolean'
    );
    const invalidParam = booleanParams.find((param) => {
      const invalid = params[param] === undefined || invalidType(param, type);
      const hasError =
        invalid || (validate && !checkValidation(params[param], validate));
      if (hasError) errorParam = param;
      return hasError;
    });
    return !booleanParams.length || invalidParam;
  });

  if (!paramError) return { valid: true };

  const error =
    params[errorParam] === undefined
      ? errors[errorParam] || INVALID_VALUES
      : (paramError.validate && paramError.invalid) || INVALID_VALUES;

  return { error, info: { param: errorParam } };
}

function checkValidation(value, validate) {
  if (isFunction(validate)) return validate(value);
  return true;
}

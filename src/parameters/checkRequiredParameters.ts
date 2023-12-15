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
} from '../constants/errorConditionConstants';

type Params = { [key: string]: any };
type RequiredParams = {
  validate?: any;
  resolve?: any;
  param: string;
  type?: string;
}[];

const errors = {
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
  if (params && !isObject(params)) return { error: INVALID_VALUES };
  if (!requiredParams || params?._bypassParamCheck) return { valid: true };

  if (!Array.isArray(requiredParams)) return { error: INVALID_VALUES };

  const paramType = (key) => typeof params[key];
  const invalidType = (param, type) => {
    type = type || paramTypes[param] || 'string';
    if (type === 'array') return !Array.isArray(params[param]);
    return paramType(param) !== type;
  };

  const paramError = requiredParams.find(({ param, type, validate }) => {
    const invalid = !params[param] || invalidType(param, type);
    return invalid || (validate && !checkValidation(params[param], validate));
  });

  if (!paramError) return { valid: true };

  const param = paramError.param;
  const error = !params[param]
    ? errors[param] || INVALID_VALUES
    : INVALID_VALUES;

  return { error, info: { param } };
}

function checkValidation(value, validate) {
  if (isFunction(validate)) return validate(value);
  return true;
}

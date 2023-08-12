import { makeDeepCopy } from '../utilities';

import {
  INVALID_OBJECT,
  MISSING_VALUE,
} from '../constants/errorConditionConstants';

import { MatchUp } from '../types/tournamentFromSchema';

type MatchUpArg = {
  [key: string | number | symbol]: unknown;
} & MatchUp;

// TASK: add verify/validate structure as option in setState

let keyedMatchUps = {};
let matchUpId;

export function setState(value: MatchUpArg, deepCopyOption = true) {
  if (!value) return { error: MISSING_VALUE };
  if (typeof value !== 'object') return { error: INVALID_OBJECT };

  if (value.matchUpId) {
    matchUpId = value.matchUpId;
    keyedMatchUps[matchUpId] = deepCopyOption ? makeDeepCopy(value) : value;
  } else if (Array.isArray(value)) {
    for (const m of value.reverse()) {
      if (m.matchUpId) {
        keyedMatchUps[m.matchUpId] = deepCopyOption ? makeDeepCopy(m) : m;
        if (!matchUpId) matchUpId = m.matchUpId;
      }
    }
  } else {
    for (const m of Object.values(value) as Array<MatchUpArg>) {
      if (m.matchUpId) {
        keyedMatchUps[m.matchUpId] = deepCopyOption ? makeDeepCopy(m) : m;
        if (!matchUpId) matchUpId = m.matchUpId;
      }
    }
  }

  return deepCopyOption ? makeDeepCopy(value) : value;
}

export function getMatchUp() {
  return keyedMatchUps[matchUpId];
}

export function getMatchUps() {
  return Object.values(keyedMatchUps);
}

export function reset() {
  matchUpId = undefined;
  keyedMatchUps = {};
}

export function getState(params?) {
  return makeDeepCopy(
    keyedMatchUps[matchUpId],
    params?.convertExtensions,
    false,
    params?.removeExtensions
  );
}

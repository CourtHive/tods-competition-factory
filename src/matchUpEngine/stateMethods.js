import { makeDeepCopy } from '../utilities';

import {
  INVALID_OBJECT,
  MISSING_VALUE,
} from '../constants/errorConditionConstants';

// TASK: add verify/validate structure as option in setState

let keyedMatchUps = {};
let matchUpId;

export function setState(value, deepCopyOption = true) {
  if (!value) return { error: MISSING_VALUE };
  if (typeof value !== 'object') return { error: INVALID_OBJECT };

  if (value.matchUpId) {
    matchUpId = value.matchUpId;
    keyedMatchUps[matchUpId] = value;
  } else if (Array.isArray(value)) {
    for (const m of value.reverse()) {
      if (m.matchUpId) {
        keyedMatchUps[m.matchUpId] = m;
        if (!matchUpId) matchUpId = m.matchUpId;
      }
    }
  } else {
    for (const m of Object.values(value)) {
      if (m.matchUpId) {
        keyedMatchUps[m.matchUpId] = m;
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

export function getState({ convertExtensions, removeExtensions } = {}) {
  return makeDeepCopy(
    keyedMatchUps[matchUpId],
    convertExtensions,
    false,
    removeExtensions
  );
}

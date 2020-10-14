import {
  OUTCOME_DEFAULT,
  OUTCOME_RETIREMENT,
  OUTCOME_WALKOVER,
  STATUS_DEFAULT,
  STATUS_RETIREMENT,
  STATUS_WALKOVER,
  STATUS_ABANDONED,
  STATUS_INTERRUPTED,
  STATUS_SUSPENDED,
  RETIRE,
  DEFAULT,
  WALKOVER,
  ABANDON,
  INTERRUPT,
  SUSPEND,
  OUTCOME_ABANDONED,
  OUTCOME_INTERRUPTED,
  OUTCOME_SUSPENDED,
} from './constants';

import { addOutcome } from './keyValueUtilities';

export function processOutcome({
  lowSide,
  value,
  sets,
  score,
  winningSide,
  matchUpStatus,
}) {
  let updated;

  if (value === RETIRE) {
    if (score) {
      updated = true;
      score = addOutcome({ score, lowSide, outcome: OUTCOME_RETIREMENT });
      winningSide = lowSide === 2 ? 1 : 2;
      matchUpStatus = STATUS_RETIREMENT;
    } else {
      updated = true;
      score = addOutcome({ score, lowSide, outcome: OUTCOME_DEFAULT });
      winningSide = lowSide === 2 ? 1 : 2;
      matchUpStatus = STATUS_DEFAULT;
    }
  } else if (value === DEFAULT) {
    updated = true;
    score = addOutcome({ score, lowSide, outcome: OUTCOME_DEFAULT });
    winningSide = lowSide === 2 ? 1 : 2;
    matchUpStatus = STATUS_DEFAULT;
  } else if (value === WALKOVER) {
    updated = true;
    sets = [];
    score = OUTCOME_WALKOVER;
    winningSide = lowSide === 2 ? 1 : 2;
    matchUpStatus = STATUS_WALKOVER;
  } else if (value === SUSPEND && score) {
    updated = true;
    score = addOutcome({ score, lowSide, outcome: OUTCOME_SUSPENDED });
    matchUpStatus = STATUS_SUSPENDED;
    winningSide = undefined;
  } else if (value === ABANDON) {
    updated = true;
    score = addOutcome({ score, lowSide, outcome: OUTCOME_ABANDONED });
    matchUpStatus = STATUS_ABANDONED;
    winningSide = undefined;
  } else if (value === INTERRUPT && score) {
    updated = true;
    score = addOutcome({ score, lowSide, outcome: OUTCOME_INTERRUPTED });
    matchUpStatus = STATUS_INTERRUPTED;
    winningSide = undefined;
  }

  return { updated, sets, score, matchUpStatus, winningSide };
}

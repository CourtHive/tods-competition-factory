import { scoreHasValue } from '../scoreGovernor/scoreHasValue';

import {
  COMPLETED,
  IN_PROGRESS,
} from '../../../constants/matchUpStatusConstants';

export function validUpdate({ matchUp, updateInProgressMatchUps }) {
  const valid =
    !matchUp.winningSide &&
    matchUp.matchUpStatus !== COMPLETED &&
    (updateInProgressMatchUps ||
      (matchUp.matchUpStatus !== IN_PROGRESS && !scoreHasValue(matchUp)));

  return valid;
}

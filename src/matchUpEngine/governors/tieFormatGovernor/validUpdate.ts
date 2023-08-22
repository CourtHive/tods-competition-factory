import { scoreHasValue } from '../queryGovernor/scoreHasValue';

import {
  completedMatchUpStatuses,
  IN_PROGRESS,
} from '../../../constants/matchUpStatusConstants';

export function validUpdate({ matchUp, updateInProgressMatchUps }) {
  return (
    !matchUp.winningSide &&
    ![completedMatchUpStatuses].includes(matchUp.matchUpStatus) &&
    (updateInProgressMatchUps ||
      (matchUp.matchUpStatus !== IN_PROGRESS && !scoreHasValue(matchUp)))
  );
}

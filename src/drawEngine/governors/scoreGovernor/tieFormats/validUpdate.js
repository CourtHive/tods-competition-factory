import { scoreHasValue } from '../scoreHasValue';

import {
  COMPLETED,
  IN_PROGRESS,
} from '../../../../constants/matchUpStatusConstants';

export function validUpdate({ matchUp, updateInProgressMatchUps }) {
  return (
    ![COMPLETED, IN_PROGRESS].includes(matchUp.matchUpStatus) &&
    !matchUp.winningSide &&
    !(!updateInProgressMatchUps && scoreHasValue(matchUp))
  );
}

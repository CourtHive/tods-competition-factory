import { isActiveMatchUpStatus } from '../governors/matchUpGovernor/checkStatusType';
import { scoreHasValue } from '../../matchUpEngine/governors/queryGovernor/scoreHasValue';

import { IN_PROGRESS } from '../../constants/matchUpStatusConstants';

// an active matchUp is one that has a winningSide, more than one set, or a single set with any score value greater than zero
// when { matchUpType: TEAM } the child tieMatchUps must be checked as well
// scoreStrings are not reliable because TEAM matchUps can have scoreString '0-0'
export function isActiveMatchUp({
  matchUpStatus,
  winningSide,
  tieMatchUps,
  score,
}) {
  const activeTieMatchUps = tieMatchUps?.filter(isActiveMatchUp)?.length;
  const scoreExists = scoreHasValue({ score });

  const activeStatus =
    scoreExists ||
    winningSide ||
    activeTieMatchUps ||
    // must exclude IN_PROGRESS as this is automatically set by updateTieMatchUpScore
    (isActiveMatchUpStatus({ matchUpStatus }) && matchUpStatus !== IN_PROGRESS);

  return activeStatus;
}

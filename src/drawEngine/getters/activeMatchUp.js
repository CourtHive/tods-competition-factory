import { isActiveMatchUpStatus } from '../governors/matchUpGovernor/checkStatusType';
import { scoreHasValue } from '../../matchUpEngine/governors/queryGovernor/scoreHasValue';

import {
  DEFAULTED,
  IN_PROGRESS,
  WALKOVER,
} from '../../constants/matchUpStatusConstants';

// an active matchUp is one that has a winningSide, more than one set, or a single set with any score value greater than zero
// when { matchUpType: TEAM } the child tieMatchUps must be checked as well
// scoreStrings are not reliable because TEAM matchUps can have scoreString '0-0'
export function isActiveMatchUp({
  matchUpStatus,
  winningSide,
  tieMatchUps,
  sides,
  score,
}) {
  const participantAssigned = sides?.find(({ participantId }) => participantId);
  const activeTieMatchUps = tieMatchUps?.filter(isActiveMatchUp)?.length;
  const scoreExists = scoreHasValue({ score });

  const activeStatus =
    scoreExists ||
    activeTieMatchUps ||
    (winningSide && participantAssigned) || // if winningSide and no participant assigned => "produced" WALKOVER
    // must exclude IN_PROGRESS as this is automatically set by updateTieMatchUpScore
    // must exclude WALKOVER and DEFAULTED as "produced" scenarios do not imply a winningSide
    (isActiveMatchUpStatus({ matchUpStatus }) &&
      ![DEFAULTED, WALKOVER, IN_PROGRESS].includes(matchUpStatus));

  return activeStatus;
}

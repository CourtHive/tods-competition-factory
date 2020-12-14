import { assignMatchUpCourt as assignCourt } from '../../../drawEngine/governors/matchUpGovernor/scheduleItems';

import {
  MISSING_DRAW_ID,
  MISSING_MATCHUP_ID,
} from '../../../constants/errorConditionConstants';

export function assignMatchUpCourt({
  drawDefinition,
  matchUpId,
  courtId,
  courtDayDate,
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  // TODO: check that 1) check that courtId is valid 2) that courtDayDate is valid
  return assignCourt({ drawDefinition, matchUpId, courtId, courtDayDate });
}

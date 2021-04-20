import { addMatchUpTimeItem } from '../../../drawEngine/governors/matchUpGovernor/timeItems';
import { findCourt } from '../../getters/courtGetter';

import {
  MISSING_MATCHUP_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { ASSIGN_COURT } from '../../../constants/timeItemConstants';

export function assignMatchUpCourt({
  tournamentRecord,
  drawDefinition,
  courtDayDate,
  matchUpId,
  courtId,
  disableNotice,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  if (courtId) {
    const result = findCourt({ tournamentRecord, courtId });
    if (result.error) return result;
  }

  const timeItem = {
    itemType: ASSIGN_COURT,
    itemDate: courtDayDate,
    itemValue: courtId,
  };

  return addMatchUpTimeItem({
    drawDefinition,
    matchUpId,
    timeItem,
    disableNotice,
    duplicateValues: false,
  });
}

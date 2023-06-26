import { matchUpTimeModifiers } from '../../../accessors/matchUpAccessor/timeModifiers';
import { scheduledMatchUpDate } from '../../../accessors/matchUpAccessor';
import { addMatchUpTimeModifiers } from './timeModifiers';
import { addMatchUpTimeItem } from '../timeItems';
import {
  convertTime,
  extractDate,
  validTimeValue,
} from '../../../../utilities/dateTime';

import { SCHEDULED_TIME } from '../../../../constants/timeItemConstants';
import {
  INVALID_TIME,
  MISSING_MATCHUP_ID,
} from '../../../../constants/errorConditionConstants';

export function addMatchUpScheduledTime({
  removePriorValues,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  scheduledTime,
  matchUpId,
  matchUp,
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  // must support undefined as a value so that scheduledTime can be cleared
  if (!validTimeValue(scheduledTime)) return { error: INVALID_TIME };

  const timeDate = extractDate(scheduledMatchUpDate);
  if (timeDate) {
    const scheduledDate = scheduledMatchUpDate({ matchUp });
    console.log('***********************', { timeDate, scheduledDate });
  }

  let existingTimeModifiers =
    matchUpTimeModifiers({ matchUp }).timeModifiers || [];

  if (existingTimeModifiers?.length) {
    const result = addMatchUpTimeModifiers({
      disableNotice: true,
      removePriorValues,
      tournamentRecord,
      timeModifiers: [],
      drawDefinition,
      matchUpId,
      matchUp,
    });
    if (result?.error) return result;
  }

  // All times stored as military time
  const militaryTime = convertTime(scheduledTime, true, true);
  const itemValue = militaryTime;
  const timeItem = {
    itemType: SCHEDULED_TIME,
    itemValue,
  };

  return addMatchUpTimeItem({
    duplicateValues: false,
    removePriorValues,
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    timeItem,
  });
}

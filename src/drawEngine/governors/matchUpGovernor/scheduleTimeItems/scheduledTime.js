import { matchUpTimeModifiers } from '../../../accessors/matchUpAccessor/timeModifiers';
import { decorateResult } from '../../../../global/functions/decorateResult';
import { scheduledMatchUpDate } from '../../../accessors/matchUpAccessor';
import { findMatchUp } from '../../../getters/getMatchUps/findMatchUp';
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

  if (!matchUp) {
    const result = findMatchUp({ drawDefinition, matchUpId });
    if (result.error) return result;
    matchUp = result.matchUp;
  }

  const timeDate = extractDate(scheduledTime);
  const stack = 'addMatchUpScheduledTime';

  if (timeDate) {
    const scheduledDate = scheduledMatchUpDate({ matchUp }).scheduledDate;
    if (scheduledDate !== timeDate) {
      return decorateResult({
        info: 'date in time does not corresponde to scheduledDate',
        result: { error: INVALID_TIME },
        stack,
      });
    }
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

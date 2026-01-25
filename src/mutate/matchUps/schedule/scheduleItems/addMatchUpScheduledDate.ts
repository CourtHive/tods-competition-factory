import { addMatchUpTimeItem } from '@Mutate/timeItems/matchUps/matchUpTimeItems';
import { dateValidation } from '@Validators/regex';
import { extractDate } from '@Tools/dateTime';

// constants and types
import { INVALID_DATE, MISSING_MATCHUP_ID } from '@Constants/errorConditionConstants';
import { AddScheduleAttributeArgs, ResultType } from '@Types/factoryTypes';
import { SCHEDULED_DATE } from '@Constants/timeItemConstants';

export function addMatchUpScheduledDate({
  scheduledDate: dateToSchedule,
  removePriorValues,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  matchUpId,
}: AddScheduleAttributeArgs & { scheduledDate?: string }): ResultType {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  // this must be done in tournamentEngine wrapper

  const validDate = dateToSchedule && dateValidation.test(dateToSchedule);
  if (dateToSchedule && !validDate) return { error: INVALID_DATE };

  const scheduledDate = extractDate(dateToSchedule);

  const timeItem = {
    itemValue: scheduledDate,
    itemType: SCHEDULED_DATE,
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

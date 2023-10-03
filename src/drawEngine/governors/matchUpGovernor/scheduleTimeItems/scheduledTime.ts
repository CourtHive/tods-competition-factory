import { matchUpTimeModifiers } from '../../../accessors/matchUpAccessor/timeModifiers';
import { decorateResult } from '../../../../global/functions/decorateResult';
import { scheduledMatchUpDate } from '../../../accessors/matchUpAccessor';
import { findMatchUp } from '../../../getters/getMatchUps/findMatchUp';
import { mustBeAnArray } from '../../../../utilities/mustBeAnArray';
import { addMatchUpTimeItem } from '../timeItems';
import {
  convertTime,
  extractDate,
  validTimeValue,
} from '../../../../utilities/dateTime';

import { SUCCESS } from '../../../../constants/resultConstants';
import { HydratedMatchUp } from '../../../../types/hydrated';
import {
  MUTUALLY_EXCLUSIVE_TIME_MODIFIERS,
  SCHEDULED_TIME,
  TIME_MODIFIERS,
} from '../../../../constants/timeItemConstants';
import {
  INVALID_TIME,
  INVALID_VALUES,
  MISSING_MATCHUP_ID,
} from '../../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  MatchUp,
  Tournament,
} from '../../../../types/tournamentFromSchema';

type AddScheduleAttributeArgs = {
  tournamentRecord?: Tournament;
  removePriorValues?: boolean;
  drawDefinition: DrawDefinition;
  disableNotice?: boolean;
  matchUpId: string;
  event?: Event;
};

type AddMatchUpScheduledTimeArgs = {
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  removePriorValues?: boolean;
  disableNotice?: boolean;
  scheduledTime?: string;
  matchUpId?: string;
  matchUp?: MatchUp;
};

export function addMatchUpScheduledTime(params: AddMatchUpScheduledTimeArgs) {
  let matchUp = params.matchUp;
  const {
    removePriorValues,
    tournamentRecord,
    drawDefinition,
    disableNotice,
    scheduledTime,
    matchUpId,
  } = params;
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
    if (scheduledDate && scheduledDate !== timeDate) {
      return decorateResult({
        info: `date in time: ${timeDate} does not corresponde to scheduledDate: ${scheduledDate}`,
        result: { error: INVALID_TIME },
        stack,
      });
    }
  }

  const existingTimeModifiers =
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

export function addMatchUpTimeModifiers({
  removePriorValues,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  timeModifiers,
  matchUpId,
  matchUp,
}: AddScheduleAttributeArgs & {
  matchUp?: HydratedMatchUp;
  timeModifiers: any[];
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  if (timeModifiers !== undefined && !Array.isArray(timeModifiers))
    return { error: INVALID_VALUES, info: mustBeAnArray('timeModifiers') };

  if (!matchUp) {
    const result = findMatchUp({ drawDefinition, matchUpId });
    if (result.error) return result;
    matchUp = result.matchUp;
  }
  let existingTimeModifiers =
    matchUpTimeModifiers({ matchUp }).timeModifiers || [];
  const toBeAdded = timeModifiers.filter(
    (modifier) => !existingTimeModifiers.includes(modifier)
  );
  if (timeModifiers.length && !toBeAdded.length) return { ...SUCCESS };

  // remove all existing exclusives if incoming includes exclusive
  const containsExclusive = toBeAdded.some((modifier) =>
    MUTUALLY_EXCLUSIVE_TIME_MODIFIERS.includes(modifier)
  );
  if (containsExclusive) {
    existingTimeModifiers = existingTimeModifiers.filter(
      (modifier) => !MUTUALLY_EXCLUSIVE_TIME_MODIFIERS.includes(modifier)
    );

    // scheduledTime should be removed for exclusive timeModifiers
    const result = addMatchUpScheduledTime({
      disableNotice: true,
      removePriorValues,
      scheduledTime: '',
      tournamentRecord,
      drawDefinition,
      matchUpId,
    });
    if (result.error) return result;
  }

  // undefined value when array is empty;
  const itemValue = !timeModifiers?.length
    ? undefined
    : [...toBeAdded, ...existingTimeModifiers];

  const timeItem = {
    itemType: TIME_MODIFIERS,
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

import { matchUpTimeModifiers } from '../../../accessors/matchUpAccessor/timeModifiers';
import { mustBeAnArray } from '../../../../utilities/mustBeAnArray';
import { addMatchUpScheduledTime } from './scheduledTime';
import { addMatchUpTimeItem } from '../timeItems';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MUTUALLY_EXCLUSIVE_TIME_MODIFIERS,
  TIME_MODIFIERS,
} from '../../../../constants/timeItemConstants';
import {
  INVALID_VALUES,
  MISSING_MATCHUP_ID,
} from '../../../../constants/errorConditionConstants';

export function addMatchUpTimeModifiers({
  removePriorValues,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  timeModifiers,
  matchUpId,
  matchUp,
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  if (timeModifiers !== undefined && !Array.isArray(timeModifiers))
    return { error: INVALID_VALUES, info: mustBeAnArray('timeModifiers') };

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

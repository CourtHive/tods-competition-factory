import { validTimeString } from '../../../fixtures/validations/regex';
import { getDevContext } from '../../../global/globalState';

import {
  MISSING_MATCHUP,
  MISSING_TIME_ITEMS,
} from '../../../constants/errorConditionConstants';
import {
  START_TIME,
  STOP_TIME,
  RESUME_TIME,
  END_TIME,
} from '../../../constants/timeItemConstants';
import { currentUTCDate } from '../../../utilities/dateTime';

function timeDate(value) {
  if (validTimeString.test(value)) {
    const dateString = currentUTCDate();
    const td = new Date(`${dateString}T${value}`);
    return td;
  } else {
    return new Date(value);
  }
}

export function matchUpDuration({ matchUp }) {
  if (!matchUp) return { error: MISSING_MATCHUP };
  if (!matchUp.timeItems) return { error: MISSING_TIME_ITEMS };

  const relevantTimeItems = matchUp.timeItems
    .filter((timeItem) =>
      [START_TIME, STOP_TIME, RESUME_TIME, END_TIME].includes(
        timeItem?.itemType
      )
    )
    .sort((a, b) => timeDate(a.itemValue) - timeDate(b.itemValue));

  const elapsed = relevantTimeItems.reduce(
    (elapsed, timeItem) => {
      let milliseconds;
      const itemTypeComponents = timeItem?.itemType?.split('.');
      const timeType =
        timeItem?.itemType?.startsWith('SCHEDULE.TIME') &&
        itemTypeComponents[2];
      const scheduleType = `SCHEDULE.TIME.${timeType}`;
      switch (scheduleType) {
        case START_TIME:
          milliseconds = 0;
          break;
        case END_TIME:
          if (
            elapsed.lastValue &&
            [START_TIME, RESUME_TIME].includes(elapsed.lastType)
          ) {
            const interval =
              timeDate(timeItem.itemValue) - timeDate(elapsed.lastValue);
            milliseconds = elapsed.milliseconds + interval;
          } else {
            milliseconds = elapsed.milliseconds;
          }
          break;
        case STOP_TIME:
          if ([START_TIME, 'SCHECULE.TIME.RESUME'].includes(elapsed.lastType)) {
            const interval =
              timeDate(timeItem.itemValue) - timeDate(elapsed.lastValue);
            milliseconds = elapsed.milliseconds + interval;
          } else {
            milliseconds = elapsed.milliseconds;
          }
          break;
        default:
          milliseconds = elapsed.milliseconds;
          break;
      }
      return {
        milliseconds,
        lastType: scheduleType,
        lastValue: timeItem.itemValue,
      };
    },
    { milliseconds: 0, lastType: undefined, lastValue: undefined }
  );

  if ([START_TIME, RESUME_TIME].includes(elapsed.lastType)) {
    if (getDevContext()) console.log('START or RESUME');
    const interval = new Date() - timeDate(elapsed.lastValue);
    elapsed.milliseconds += interval;
  }

  return {
    milliseconds: elapsed.milliseconds,
    time: msToTime(elapsed.milliseconds),
    relevantTimeItems,
  };
}

function msToTime(s) {
  const pad = (n, z = 2) => ('00' + n).slice(-z);
  return (
    pad((s / 3.6e6) | 0) +
    ':' +
    pad(((s % 3.6e6) / 6e4) | 0) +
    ':' +
    pad(((s % 6e4) / 1000) | 0)
  );
}

import { validTimeString } from '../../../fixtures/validations/regex';

import {
  MISSING_MATCHUP,
  MISSING_TIME_ITEMS,
} from '../../../constants/errorConditionConstants';

function timeDate(value) {
  if (validTimeString.test(value)) {
    const td = new Date(`2020-01-01T${value}`);
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
      [
        'SCHEDULE.TIME.START',
        'SCHEDULE.TIME.STOP',
        'SCHEDULE.TIME.RESUME',
        'SCHEDULE.TIME.END',
      ].includes(timeItem.itemType)
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
        case 'SCHEDULE.TIME.START':
          milliseconds = 0;
          break;
        case 'SCHEDULE.TIME.END':
          if (
            elapsed.lastValue &&
            ['SCHEDULE.TIME.START', 'SCHEDULE.TIME.RESUME'].includes(
              elapsed.lastType
            )
          ) {
            const interval =
              timeDate(timeItem.itemValue) - timeDate(elapsed.lastValue);
            milliseconds = elapsed.milliseconds + interval;
          } else {
            milliseconds = elapsed.milliseconds;
          }
          break;
        case 'SCHEDULE.TIME.STOP':
          if (
            ['SCHEDULE.TIME.START', 'SCHECULE.TIME.RESUME'].includes(
              elapsed.lastType
            )
          ) {
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

  if (
    ['SCHEDULE.TIME.START', 'SCHEDULE.TIME.RESUME'].includes(elapsed.lastType)
  ) {
    console.log('START or RESUME');
    // TODO: test this... matchUp has not clompleted and is active
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

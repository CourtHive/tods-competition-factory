import { validTimeString } from '../../../fixtures/validations/regex';

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
    .filter(timeItem =>
      [START_TIME, STOP_TIME, RESUME_TIME, END_TIME].includes(
        timeItem.itemSubject
      )
    )
    .sort((a, b) => timeDate(a.itemValue) - timeDate(b.itemValue));

  const elapsed = relevantTimeItems.reduce(
    (elapsed, timeItem) => {
      let milliseconds;
      switch (timeItem.itemSubject) {
        case START_TIME:
          milliseconds = 0;
          break;
        case END_TIME:
          if (
            elapsed.lastValue &&
            [START_TIME, RESUME_TIME].includes(elapsed.lastSubject)
          ) {
            const interval =
              timeDate(timeItem.itemValue) - timeDate(elapsed.lastValue);
            milliseconds = elapsed.milliseconds + interval;
          } else {
            milliseconds = elapsed.milliseconds;
          }
          break;
        case STOP_TIME:
          if ([START_TIME, RESUME_TIME].includes(elapsed.lastSubject)) {
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
        lastSubject: timeItem.itemSubject,
        lastValue: timeItem.itemValue,
      };
    },
    { milliseconds: 0, lastSubject: undefined, lastValue: undefined }
  );

  if ([START_TIME, RESUME_TIME].includes(elapsed.lastSubject)) {
    // matchUp has not completed and is active
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

import {
  START_TIME,
  STOP_TIME,
  RESUME_TIME,
  END_TIME,
} from '../../../constants/timeItemConstants';

export function matchUpDuration({ matchUp }) {
  if (!matchUp) return { error: 'Missing matchUp' };
  if (!matchUp.timeItems) return { error: 'Missing timeItems' };

  const relevantTimeItems = matchUp.timeItems
    .filter(timeItem =>
      [START_TIME, STOP_TIME, RESUME_TIME, END_TIME].includes(
        timeItem.itemSubject
      )
    )
    .sort((a, b) => new Date(a.itemValue) - new Date(b.itemValue));

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
              new Date(timeItem.itemValue) - new Date(elapsed.lastValue);
            milliseconds = elapsed.milliseconds + interval;
          } else {
            milliseconds = elapsed.milliseconds;
          }
          break;
        case STOP_TIME:
          if ([START_TIME, RESUME_TIME].includes(elapsed.lastSubject)) {
            const interval =
              new Date(timeItem.itemValue) - new Date(elapsed.lastValue);
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
    const interval = new Date() - new Date(elapsed.lastValue);
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

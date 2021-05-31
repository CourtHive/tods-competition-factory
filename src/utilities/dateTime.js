import { dateValidation, validDateString } from '../fixtures/validations/regex';
import {
  INVALID_DATE,
  INVALID_TIME_ZONE,
} from '../constants/errorConditionConstants';

export function isDate(dateArg) {
  if (typeof dateArg == 'boolean') return false;
  const t =
    dateArg instanceof Date
      ? dateArg
      : !isNaN(dateArg)
      ? new Date(dateArg)
      : false;
  return t && !isNaN(t.valueOf());
}

export function isDateObject(value) {
  if (typeof value !== 'object' || Array.isArray(value)) {
    return false;
  } else {
    const datePrototype = Object.prototype.toString.call(value);
    return datePrototype === '[object Date]';
  }
}

export function isValidDateString(scheduleDate) {
  return isISODateString(scheduleDate) || validDateString.test(scheduleDate);
}

export function DateHHMM(date) {
  const dt = new Date(date);
  const secs = dt.getSeconds() + 60 * dt.getMinutes() + 60 * 60 * dt.getHours();
  return HHMMSS(secs, { displaySeconds: false });
}

export function HHMMSS(s, format) {
  const secondNumber = parseInt(s, 10); // don't forget the second param
  const hours = Math.floor(secondNumber / 3600);
  const minutes = Math.floor((secondNumber - hours * 3600) / 60);
  const seconds = secondNumber - hours * 3600 - minutes * 60;

  const displaySeconds = !format || (format && format.displaySeconds);
  const timeString = displaySeconds
    ? hours + ':' + minutes + ':' + seconds
    : hours + ':' + minutes;
  return timeString.split(':').map(zeroPad).join(':');
}

export const currentUTCDate = () => {
  const date = new Date();
  const utcMonth =
    date.getUTCMonth().toString().length === 1
      ? `0${date.getUTCMonth() + 1}`
      : `${date.getUTCMonth()}`;
  return `${date.getUTCFullYear()}-${zeroPad(utcMonth)}-${zeroPad(
    date.getUTCDate()
  )}`;
};

export const currentUTCDateWithTime = () => {
  const date = new Date();
  const utcHours = date.getUTCHours();
  const utcMinutes = date.getMinutes();
  return `${currentUTCDate()}T${utcHours}:${utcMinutes}`;
};

export function timeUTC(date) {
  const dateDate = new Date(date);
  return Date.UTC(
    dateDate.getFullYear(),
    dateDate.getMonth(),
    dateDate.getDate()
  );
}

export function localizeDate(date, dateLocalization, locale) {
  const defaultLocalization = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString(
    locale,
    dateLocalization || defaultLocalization
  );
}

export function formatDate(date, separator = '-', format = 'YMD') {
  if (!date) return '';
  if (!isNaN(date)) date = offsetTime(date);

  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  if (format === 'DMY') return [day, month, year].join(separator);
  if (format === 'MDY') return [month, day, year].join(separator);
  if (format === 'YDM') return [year, day, month].join(separator);
  if (format === 'DYM') return [day, year, month].join(separator);
  if (format === 'MYD') return [month, year, day].join(separator);
  return [year, month, day].join(separator);
}

export function offsetDate(date) {
  const targetTime = date ? new Date(date) : new Date();
  const tzDifference = targetTime.getTimezoneOffset();
  return new Date(targetTime.getTime() - tzDifference * 60 * 1000);
}

export function offsetTime(date) {
  return offsetDate(date).getTime();
}

export function dateRange(startDt, endDt) {
  const startDate = new Date(startDt);
  const endDate = new Date(endDt);
  const error =
    isDate(endDate) && isDate(startDate) && isValidDateRange(startDate, endDate)
      ? false
      : true;
  const between = [];
  let iterations = 0;
  let keepLooping = true;

  if (error) {
    console.log('error occured!!!... Please Enter Valid Dates');
  } else {
    const currentDate = offsetDate(startDate);
    const end = offsetDate(endDate);
    while (currentDate <= end && keepLooping) {
      iterations += 1;
      if (iterations > 300) {
        console.log('excessive while loop');
        keepLooping = false;
      }
      // must be a *new* Date otherwise it is an array of the same object
      between.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return between;

  function isValidDateRange(minDate, maxDate) {
    return offsetDate(minDate) <= offsetDate(maxDate);
  }
}

// matches valid ISO date string
const re =
  /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([.,]\d+(?!:))?)?(\17[0-5]\d([.,]\d+)?)?([zZ]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
export function isISODateString(dateString) {
  if (typeof dateString !== 'string') return false;
  return re.test(dateString);
}

function isTimeString(timeString) {
  if (typeof timeString !== 'string') return false;
  const parts = timeString.split(':');
  const isNumeric = parts.every((part) => !isNaN(part));
  if (parts.length < 2 || !isNumeric) return false;
  if (parseInt(parts[0]) > 23) return false;
  if (parseInt(parts[1]) > 60) return false;
  return true;
}

export function tidyTime(timeString) {
  return timeString.split(':').slice(0, 2).map(zeroPad).join(':');
}

export function extractTime(dateString) {
  return isISODateString(dateString)
    ? tidyTime(dateString.split('T').reverse()[0])
    : isTimeString(dateString)
    ? tidyTime(dateString)
    : undefined;
}

export function extractDate(dateString) {
  return isISODateString(dateString) || dateValidation.test(dateString)
    ? dateString.split('T')[0]
    : undefined;
}

// returns 2020-01-01T00:00:00.000Z
export function isoDateString(date) {
  const formattedDate = formatDate(date);
  return new Date(formattedDate).toISOString();
}

export function dateStringDaysChange(dateString, daysChange) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + daysChange);
  return extractDate(date.toISOString());
}

function splitTime(value) {
  value = value || '00:00';
  const o = {},
    time = {};
  ({ 0: o.time, 1: o.ampm } = (value && value.split(' ')) || '');
  ({ 0: time.hours, 1: time.minutes } = (o.time && o.time.split(':')) || '');
  time.ampm = o.ampm;
  return time;
}

export function militaryTime(value) {
  const time = splitTime(value);
  if (time.ampm && time.hours) {
    if (time.ampm.toLowerCase() === 'pm' && parseInt(time.hours) < 12)
      time.hours = ((time.hours && parseInt(time.hours)) || 0) + 12;
    if (time.ampm.toLowerCase() === 'am' && time.hours === '12')
      time.hours = '00';
  }
  const timeString = `${time.hours || '12'}:${time.minutes || '00'}`;
  return timeString.split(':').map(zeroPad).join(':');
}

export function regularTime(value) {
  const time = splitTime(value);
  if (time.ampm) return value;
  if (time.hours > 12) {
    time.hours -= 12;
    time.ampm = 'PM';
  } else if (time.hours === '12') {
    time.ampm = 'PM';
  } else if (time.hours === '00') {
    time.hours = '12';
    time.ampm = 'AM';
  } else {
    time.ampm = 'AM';
  }
  if (time.hours[0] === '0') {
    time.hours = time.hours.slice(1);
  }

  return `${time.hours || '12'}:${time.minutes || '00'} ${time.ampm}`;
}

export function convertTime(value, time24) {
  return time24 ? militaryTime(value) : regularTime(value);
}

export function futureDate(days = 1) {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + days);
  return currentDate;
}

export function getWeek(date, dowOffset = 2) {
  date = new Date(+date);
  dowOffset = safeParseInt(dowOffset) ? dowOffset : 0;
  const newYear = new Date(date.getFullYear(), 0, 1);
  let day = newYear.getDay() - dowOffset;
  day = day >= 0 ? day : day + 7;
  const daynum =
    Math.floor(
      (date.getTime() -
        newYear.getTime() -
        (date.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) /
        86400000
    ) + 1;

  let weeknum;

  //if the year starts before the middle of a week
  if (day < 4) {
    weeknum = Math.floor((daynum + day - 1) / 7) + 1;
    if (weeknum > 52) {
      const nYear = new Date(date.getFullYear() + 1, 0, 1);
      let nday = nYear.getDay() - dowOffset;
      nday = nday >= 0 ? nday : nday + 7;
      weeknum = nday < 4 ? 1 : 53;
    }
  } else {
    weeknum = Math.floor((daynum + day - 1) / 7);
  }
  return weeknum;
}

function safeParseInt(value) {
  const result = parseInt(value);
  return isNaN(result) ? undefined : result;
}

export function timeSort(a, b) {
  const as = splitTime(a);
  const bs = splitTime(b);
  if (parseInt(as.hours) < parseInt(bs.hours)) return -1;
  if (parseInt(as.hours) > parseInt(bs.hours)) return 1;
  if (as.hours === bs.hours) {
    if (parseInt(as.minutes) < parseInt(bs.minutes)) return -1;
    if (parseInt(as.minutes) > parseInt(bs.minutes)) return 1;
  }
  return 0;
}

export function weekDays(date) {
  const dates = [0, 1, 2, 3, 4, 5, 6].map((i) => dayOfWeek(date, i));
  return dates;

  function dayOfWeek(date, index) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = index - day;
    return new Date(d.setDate(d.getDate() + diff));
  }
}

export function addWeek(date) {
  const now = new Date(date);
  return now.setDate(now.getDate() + 7);
}
export function subtractWeek(date) {
  const now = new Date(date);
  return now.setDate(now.getDate() - 7);
}
export function getDateByWeek(week, year) {
  const d = new Date(year, 0, 1);
  const dayNum = d.getDay();
  let requiredDate = --week * 7;
  if (dayNum !== 0 || dayNum > 4) requiredDate += 7;
  d.setDate(1 - d.getDay() + ++requiredDate);
  return d;
}

export function validDate(datestring, range) {
  if (!datestring) return false;
  const dateparts = formatDate(datestring).split('-');
  if (isNaN(dateparts.join(''))) return false;
  if (dateparts.length !== 3) return false;
  if (dateparts[0].length !== 4) return false;
  if (+dateparts[1] > 12 || +dateparts[1] < 1) return false;
  if (+dateparts[2] > 31 || +dateparts[2] < 1) return false;
  if (range && range.start) {
    if (offsetDate(datestring) < offsetDate(range.start)) return false;
  }
  if (range && range.end) {
    if (offsetDate(datestring) > offsetDate(range.end)) return false;
  }
  if (new Date(datestring) === INVALID_DATE) return false;
  return true;
}

export function dateFromDay(year, day) {
  const date = new Date(year, 0); // initialize a date in `year-01-01`
  return new Date(date.setDate(day)); // add the number of days
}

export function ymd2date(ymd) {
  const parts = ymd.split('-');
  if (!parts || parts.length !== 3) return new Date(ymd);
  if (isNaN(parseInt(parts[1]))) return new Date(ymd);
  return new Date(parts[0], parseInt(parts[1]) - 1, parts[2]);
}

export function timeToDate(timeString, date = undefined) {
  const [hours, minutes] = (timeString || '00:00').split(':').map(zeroPad);
  const milliseconds = offsetDate(date).setHours(hours, minutes, 0, 0);
  return offsetDate(milliseconds);
}

export function minutesDifference(date1, date2, absolute = true) {
  const dt1 = new Date(date1);
  const dt2 = new Date(date2);
  const diff = (dt2.getTime() - dt1.getTime()) / 1000 / 60;
  return absolute ? Math.abs(Math.round(diff)) : Math.round(diff);
}

export function addMinutesToTimeString(timeString, minutes) {
  return extractTime(addMinutes(timeToDate(timeString), minutes).toISOString());
}

export function addMinutes(startDate, minutes) {
  const date = new Date(startDate);
  return new Date(date.getTime() + minutes * 60000);
}

export function zeroPad(number) {
  return number.toString()[1] ? number : '0' + number;
}

export function sameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 *
 * @param {date || string} date - date object or valid date string
 * @param {string} timeZone - IANA code, e.g. 'America/New_York'
 */
export function getTimeZoneOffset({ date, timeZone } = {}) {
  // assume if provided a date string with no time element that
  // the date is intended to represent this date in local time zone

  const isMissingDate = typeof date === 'string' && date.indexOf('-') < 0;
  if (isMissingDate) return { error: INVALID_DATE };

  const isDateStringMissingTime =
    typeof date === 'string' && date.length === 10;

  // if date is a string without time coerce to midnight of the date
  const dateWithTime = isDateStringMissingTime
    ? new Date(`${date}T00:00`)
    : date;

  // if no date was provided assume the goal is current time or to know the difference
  const originalDate = dateWithTime ? new Date(dateWithTime) : new Date();

  if (originalDate === INVALID_DATE) return { error: INVALID_DATE };

  let localeString;

  try {
    localeString = originalDate
      .toLocaleString('en-CA', { timeZone, hour12: false })
      .replace(', ', 'T');
  } catch (err) {
    return { error: INVALID_TIME_ZONE };
  }

  if (localeString?.toLowerCase().indexOf('invalid') >= 0)
    return { error: INVALID_DATE };

  localeString +=
    '.' + originalDate.getMilliseconds().toString().padStart(3, '0');

  const offsetDate = new Date(localeString + 'Z');
  const offsetISOString = new Date(offsetDate).toISOString();

  const offsetMilliseconds = -(offsetDate - originalDate);
  const offsetMinutes = offsetMilliseconds / 60 / 1000;

  return {
    originalDate,
    offsetDate,
    offsetMinutes,
    offsetISOString,
    offsetMilliseconds,
  };
}

export const dateTime = {
  sameDay,
  timeUTC,
  DateHHMM,
  extractTime,
  extractDate,
  ymd2date,
  validDate,
  formatDate,
  offsetDate,
  offsetTime,
  futureDate,
  timeToDate,
  convertTime,
  getDateByWeek,
  currentUTCDate,
  getTimeZoneOffset,
  isTimeString,
  isISODateString,
  addMinutesToTimeString,
};

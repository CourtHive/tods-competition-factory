import {
  dateValidation,
  timeValidation,
  validDateString,
} from '../fixtures/validations/regex';

export function getIsoDateString(schedule) {
  let { scheduledDate, scheduledTime } = schedule;
  if (!scheduledDate && scheduledTime)
    scheduledDate = extractDate(scheduledTime);
  if (!scheduledDate) return;

  const extractedTime = extractTime(scheduledTime);
  let isoDateString = extractDate(scheduledDate);
  if (isoDateString && extractedTime) isoDateString += `T${extractedTime}`;
  return isoDateString;
}

export function isDateObject(value) {
  if (typeof value !== 'object' || Array.isArray(value)) {
    return false;
  } else {
    const datePrototype = Object.prototype.toString.call(value);
    return datePrototype === '[object Date]';
  }
}

export function validTimeValue(value) {
  const spaceSplit = typeof value === 'string' && value?.split(' ');
  if (
    value &&
    spaceSplit?.length > 1 &&
    !['AM', 'PM'].includes(spaceSplit[1].toUpperCase())
  )
    return false;

  return !!(!value || timeValidation.test(convertTime(value, true, true)));
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

export const getUTCdateString = (date) => {
  const dateDate =
    isDate(date) || isISODateString(date) ? new Date(date) : new Date();
  const monthNumber = dateDate.getUTCMonth() + 1;
  const utcMonth = monthNumber < 10 ? `0${monthNumber}` : `${monthNumber}`;
  return `${dateDate.getUTCFullYear()}-${zeroPad(utcMonth)}-${zeroPad(
    dateDate.getUTCDate()
  )}`;
};

export function timeUTC(date) {
  const dateDate =
    isDate(date) || isISODateString(date) ? new Date(date) : new Date();
  return Date.UTC(
    dateDate.getFullYear(),
    dateDate.getMonth(),
    dateDate.getDate()
  );
}

export function localizeDate(submittedDate, dateLocalization, locale) {
  const date = new Date(submittedDate);
  if (!isDate(date)) return false;
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
  if (typeof date === 'string' && date.indexOf('T') < 0) date = date + 'T00:00';

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

// only returns true for valid date objects
// dateArg = new Date('xxx') produces 'Invalid Date', which return false
export function isDate(dateArg) {
  if (typeof dateArg == 'boolean') return false;
  const t =
    (dateArg instanceof Date && dateArg) ||
    (!isNaN(dateArg) && new Date(dateArg)) ||
    false;
  return t && !isNaN(t.valueOf());
}

export function dateRange(startDt, endDt) {
  if (!isValidDateString(startDt) || !isValidDateString(endDt)) return [];

  const startDateString = extractDate(startDt) + 'T00:00';
  const endDateString = extractDate(endDt) + 'T00:00';
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);
  const error =
    isDate(endDate) && isDate(startDate) && isValidDateRange(startDate, endDate)
      ? false
      : true;
  const between = [];
  let iterations = 0;

  if (!error) {
    const currentDate = startDate;
    while (currentDate <= endDate && iterations < 300) {
      iterations += 1;
      // must be a *new* Date otherwise it is an array of the same object
      between.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return between.map((date) => formatDate(date));

  function isValidDateRange(minDate, maxDate) {
    return minDate <= maxDate;
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
  const noZ = timeString.split('Z')[0];
  const parts = noZ.split(':');
  const isNumeric = parts.every((part) => !isNaN(part));
  return parts.length < 2 ||
    !isNumeric ||
    parseInt(parts[0]) > 23 ||
    parseInt(parts[1]) > 60
    ? false
    : true;
}

export function timeStringMinutes(timeString) {
  const validTimeString = extractTime(timeString);
  if (!validTimeString) return 0;
  const [hours, minutes] = validTimeString
    .split(':')
    .map((value) => parseInt(value));
  return hours * 60 + minutes;
}

export function dayMinutesToTimeString(totalMinutes) {
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes - hours * 60;
  if (hours > 23) hours = hours % 24;
  return [zeroPad(hours), zeroPad(minutes)].join(':');
}

export function tidyTime(timeString) {
  return isTimeString(timeString)
    ? timeString.split(':').slice(0, 2).map(zeroPad).join(':')
    : undefined;
}

export function extractTime(dateString) {
  return isISODateString(dateString) && dateString.indexOf('T') > 0
    ? tidyTime(dateString.split('T').reverse()[0])
    : tidyTime(dateString);
}

export function extractDate(dateString) {
  return isISODateString(dateString) || dateValidation.test(dateString)
    ? dateString.split('T')[0]
    : undefined;
}

export function dateStringDaysChange(dateString, daysChange) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + daysChange);
  return extractDate(date.toISOString());
}

export function splitTime(value) {
  value = typeof value !== 'string' ? '00:00' : value;
  const o = {},
    time = {};
  ({ 0: o.time, 1: o.ampm } = value.split(' ') || []);
  ({ 0: time.hours, 1: time.minutes } = o.time.split(':') || []);
  time.ampm = o.ampm;

  if (
    isNaN(time.hours) ||
    isNaN(time.minutes) ||
    (time.ampm && !['AM', 'PM'].includes(time.ampm.toUpperCase()))
  )
    return {};
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
  if (typeof time === 'object' && !Object.keys(time).length) return undefined;

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
  if (time.hours?.[0] === '0') {
    time.hours = time.hours.slice(1);
  }

  return `${time.hours || '12'}:${time.minutes || '00'} ${time.ampm}`;
}

export function convertTime(value, time24, keepDate) {
  const hasDate = extractDate(value);
  const timeString = extractTime(value);
  const timeValue = hasDate ? timeString : value;

  return !value
    ? undefined
    : (time24 && ((hasDate && keepDate && value) || militaryTime(timeValue))) ||
        regularTime(timeValue);
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

export function weekDays(date = new Date(), firstDayOfWeek = 0) {
  if (!isDate(date)) return [];
  const dates = [0, 1, 2, 3, 4, 5, 6].map((i) =>
    dayOfWeek(date, i + firstDayOfWeek)
  );
  return dates;

  function dayOfWeek(date, index) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = index - day;

    const nextDate = new Date(d.setDate(d.getDate() + diff));
    return formatDate(nextDate);
  }
}

export function addDays(date, days = 7) {
  const universalDate = extractDate(date) + 'T00:00';
  const now = new Date(universalDate);
  let adjustedDate = new Date(now.setDate(now.getDate() + days));
  return formatDate(adjustedDate);
}
export function addWeek(date) {
  return addDays(date);
}
export function subtractWeek(date, dateFormat) {
  const universalDate = extractDate(date) + 'T00:00';
  const now = new Date(universalDate);
  return formatDate(now.setDate(now.getDate() - 7), dateFormat);
}

export function getDateByWeek(week, year, dateFormat, sunday = false) {
  let date = new Date(year, 0, 1 + (week - 1) * 7);
  const startValue = sunday ? 0 : 1;
  date.setDate(date.getDate() + (startValue - date.getDay()));
  return formatDate(date, dateFormat);
}

export function dateFromDay(year, day, dateFormat) {
  const date = new Date(year, 0); // initialize a date in `year-01-01`
  return formatDate(new Date(date.setDate(day)), dateFormat); // add the number of days
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
  const validTimeString = extractTime(timeString);
  if (!validTimeString) return '00:00';
  const minutesToAdd = isNaN(minutes) ? 0 : minutes;
  return extractTime(
    addMinutes(timeToDate(validTimeString), minutesToAdd).toISOString()
  );
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
/*
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
*/

/*
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
export function futureDate(days = 1) {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + days);
  return currentDate;
}

// get the week number 1-52 in the year for the given date
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
export function ymd2date(ymd) {
  const parts = ymd.split('-');
  if (!parts || parts.length !== 3) return new Date(ymd);
  if (isNaN(parseInt(parts[1]))) return new Date(ymd);
  return new Date(parts[0], parseInt(parts[1]) - 1, parts[2]);
}
// returns 2020-01-01T00:00:00.000Z
export function isoDateString(date) {
  const formattedDate = formatDate(date);
  return new Date(formattedDate).toISOString();
}
*/

export const dateTime = {
  addMinutesToTimeString,
  convertTime,
  getIsoDateString,
  getUTCdateString,
  DateHHMM,
  extractDate,
  extractTime,
  formatDate,
  getDateByWeek,
  isISODateString,
  isDate,
  isTimeString,
  offsetDate,
  offsetTime,
  sameDay,
  timeStringMinutes,
  timeToDate,
  timeUTC,
  validTimeValue,
  validDateString,
  timeValidation,
  dateValidation,
};

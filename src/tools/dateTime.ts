import { dateValidation, timeValidation, validDateString } from '@Validators/regex';

export function getIsoDateString(schedule) {
  let { scheduledDate } = schedule;
  if (!scheduledDate && schedule.scheduledTime) scheduledDate = extractDate(schedule.scheduledTime);
  if (!scheduledDate) return;

  const extractedTime = extractTime(schedule.scheduledTime);
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
  const spaceSplit = typeof value === 'string' ? value?.split(' ') : [];
  if (value && spaceSplit?.length > 1 && !['AM', 'PM'].includes(spaceSplit[1].toUpperCase())) return false;

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

export function HHMMSS(s, format?) {
  const secondNumber = parseInt(s, 10); // don't forget the second param
  const hours = Math.floor(secondNumber / 3600);
  const minutes = Math.floor((secondNumber - hours * 3600) / 60);
  const seconds = secondNumber - hours * 3600 - minutes * 60;

  const displaySeconds = !format || format?.displaySeconds;
  const timeString = displaySeconds ? hours + ':' + minutes + ':' + seconds : hours + ':' + minutes;
  return timeString.split(':').map(zeroPad).join(':');
}

export const getUTCdateString = (date?) => {
  const dateDate = isDate(date) || isISODateString(date) ? new Date(date) : new Date();
  const monthNumber = dateDate.getUTCMonth() + 1;
  const utcMonth = monthNumber < 10 ? `0${monthNumber}` : `${monthNumber}`;
  return `${dateDate.getUTCFullYear()}-${zeroPad(utcMonth)}-${zeroPad(dateDate.getUTCDate())}`;
};

export function timeUTC(date?) {
  const dateDate = isDate(date) || isISODateString(date) ? new Date(date) : new Date();
  return Date.UTC(dateDate.getFullYear(), dateDate.getMonth(), dateDate.getDate());
}

export function localizeDate(submittedDate, dateLocalization, locale) {
  const date = new Date(submittedDate);
  if (!isDate(date)) return undefined;
  const defaultLocalization = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString(locale, dateLocalization || defaultLocalization);
}

export function formatDate(date?, separator = '-', format = 'YMD') {
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

export function offsetTime(date?) {
  return offsetDate(date).getTime();
}

// only returns true for valid date objects
// dateArg = new Date('xxx') produces 'Invalid Date', which return false
export function isDate(dateArg) {
  if (typeof dateArg == 'boolean') return false;
  const t = (dateArg instanceof Date && dateArg) || (!isNaN(dateArg) && new Date(dateArg)) || false;
  return t && !isNaN(t.valueOf());
}

export function generateDateRange(startDt?, endDt?) {
  if (!isValidDateString(startDt) || !isValidDateString(endDt)) return [];

  const startDateString = extractDate(startDt) + 'T00:00';
  const endDateString = extractDate(endDt) + 'T00:00';
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);
  const process = isDate(endDate) && isDate(startDate) && isValidDateRange(startDate, endDate);
  const between: Date[] = [];
  let iterations = 0;

  if (process) {
    const currentDate = startDate;
    let dateSecs = currentDate.getTime();
    while (dateSecs <= endDate.getTime() && iterations < 300) {
      iterations += 1;
      // must be a *new* Date otherwise it is an array of the same object
      between.push(new Date(currentDate));
      dateSecs = currentDate.setDate(currentDate.getDate() + 1);
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

export function isTimeString(timeString) {
  if (typeof timeString !== 'string') return false;
  const noZ = timeString.split('Z')[0];
  const parts: string[] = noZ.split(':');
  const isNumeric = parts.every((part) => !isNaN(parseInt(part)));
  const invalid = parts.length < 2 || !isNumeric || parseInt(parts[0]) > 23 || parseInt(parts[1]) > 60;
  return !invalid;
}

export function timeStringMinutes(timeString?) {
  const validTimeString = extractTime(timeString);
  if (!validTimeString) return 0;
  const [hours, minutes] = validTimeString.split(':').map((value) => parseInt(value));
  return hours * 60 + minutes;
}

export function dayMinutesToTimeString(totalMinutes) {
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes - hours * 60;
  if (hours > 23) hours = hours % 24;
  return [zeroPad(hours), zeroPad(minutes)].join(':');
}

export function tidyTime(timeString) {
  return isTimeString(timeString) ? timeString.split(':').slice(0, 2).map(zeroPad).join(':') : undefined;
}

export function extractTime(dateString) {
  return isISODateString(dateString) && dateString.indexOf('T') > 0
    ? tidyTime(dateString.split('T').reverse()[0])
    : tidyTime(dateString);
}

export function extractDate(dateString) {
  return isISODateString(dateString) || dateValidation.test(dateString) ? dateString.split('T')[0] : undefined;
}

export function dateStringDaysChange(dateString, daysChange) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + daysChange);
  return extractDate(date.toISOString());
}

export function splitTime(value) {
  value = typeof value !== 'string' ? '00:00' : value;
  const o: any = {},
    time: any = {};
  ({ 0: o.time, 1: o.ampm } = value.split(' ') || []);
  ({ 0: time.hours, 1: time.minutes } = o.time.split(':') || []);
  time.ampm = o.ampm;

  if (isNaN(time.hours) || isNaN(time.minutes) || (time.ampm && !['AM', 'PM'].includes(time.ampm.toUpperCase())))
    return {};
  return time;
}

export function militaryTime(value?) {
  const time = splitTime(value);
  if (time.ampm && time.hours) {
    if (time.ampm.toLowerCase() === 'pm' && parseInt(time.hours) < 12)
      time.hours = ((time.hours && parseInt(time.hours)) || 0) + 12;
    if (time.ampm.toLowerCase() === 'am' && time.hours === '12') time.hours = '00';
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

export function convertTime(value, time24?, keepDate?) {
  const hasDate = extractDate(value);
  const timeString = extractTime(value);
  const timeValue = hasDate ? timeString : value;

  return !value
    ? undefined
    : (time24 && ((hasDate && keepDate && value) || militaryTime(timeValue))) || regularTime(timeValue);
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

export function weekdays(date: any = new Date(), firstDayOfWeek = 0) {
  if (!isDate(date)) return [];
  const dates = [0, 1, 2, 3, 4, 5, 6].map((i) => dayOfWeek(date, i + firstDayOfWeek));
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
  const adjustedDate = new Date(now.setDate(now.getDate() + days));
  return formatDate(adjustedDate);
}
export function addWeek(date) {
  return addDays(date);
}
export function subtractWeek(date, dateFormat?) {
  const universalDate = extractDate(date) + 'T00:00';
  const now = new Date(universalDate);
  return formatDate(now.setDate(now.getDate() - 7), dateFormat);
}

export function getDateByWeek(week, year, dateFormat, sunday = false) {
  const date = new Date(year, 0, 1 + (week - 1) * 7);
  const startValue = sunday ? 0 : 1;
  date.setDate(date.getDate() + (startValue - date.getDay()));
  return formatDate(date, dateFormat);
}

export function dateFromDay(year, day, dateFormat?) {
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

export function addMinutesToTimeString(timeString?, minutes?) {
  const validTimeString = extractTime(timeString);
  if (!validTimeString) return '00:00';
  const minutesToAdd = isNaN(minutes) ? 0 : minutes;
  return extractTime(addMinutes(timeToDate(validTimeString), minutesToAdd).toISOString());
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
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

export const dateTime = {
  addDays,
  addWeek,
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

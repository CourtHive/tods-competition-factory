export function isDate(dateArg) {
   if (typeof dateArg == 'boolean') return false;
   var t = (dateArg instanceof Date) ? dateArg : !isNaN(dateArg) ? new Date(dateArg) : false;
   return t && !isNaN(t.valueOf());
}

export function DateHHMM(date) {
   var dt = new Date(date);
   var secs = dt.getSeconds() + (60 * dt.getMinutes()) + (60 * 60 * dt.getHours()); 
   return HHMMSS(secs, { display_seconds: false });
}

export function HHMMSS(s, format) {
   var sec_num = parseInt(s, 10); // don't forget the second param
   var hours   = Math.floor(sec_num / 3600);
   var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
   var seconds = sec_num - (hours * 3600) - (minutes * 60);

   let display_seconds = !format || (format && format.display_seconds);
   let timeString = display_seconds ? hours+':'+minutes+':'+seconds : hours+':'+minutes;
   return timeString.split(':').map(zeroPad).join(':');
}

export const currentUTCDate = () => {
  const date = new Date();
  const utcMonth = date.getUTCMonth().toString().length === 1 ? `0${date.getUTCMonth() + 1}` : `${date.getUTCMonth()}`;
  return `${date.getUTCFullYear()}-${utcMonth}-${date.getUTCDate()}`;
};

export const currentUTCDateWithTime = () => {
  const date = new Date();
  const utcHours = date.getUTCHours();
  const utcMinutes = date.getMinutes();
  return `${currentUTCDate()}T${utcHours}:${utcMinutes}`;
};

export function timeUTC(date) {
   let dateDate = new Date(date);
   return Date.UTC(dateDate.getFullYear(), dateDate.getMonth(), dateDate.getDate());
}

export function localizeDate(date, date_localization, locale) {
   let default_localization = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
   return date.toLocaleDateString(locale, date_localization || default_localization);
}

export function formatDate(date, separator = '-', format='YMD') {
   if (!date) return '';
   if (!isNaN(date)) date = offsetTime(date);

   let d = new Date(date);
   let month = '' + (d.getMonth() + 1);
   let day = '' + d.getDate();
   let year = d.getFullYear();

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
   return new Date(targetTime.getTime() + tzDifference * 60 * 1000);
}

export function offsetTime(date) { return offsetDate(date).getTime(); }

export function dateRange(startDt, endDt) {
   let error = ((isDate(endDt)) && (isDate(startDt)) && isValidDateRange(startDt, endDt)) ? false : true;
   let between = [];
   let iterations = 0;
   let keep_looping = true;

   if (error) {
         console.log('error occured!!!... Please Enter Valid Dates');
   } else {
         var currentDate = offsetDate(startDt);
         var end = offsetDate(endDt);
         while (currentDate <= end && keep_looping) {
            iterations += 1;
            if (iterations > 300) {
               console.log('excessive while loop');
               keep_looping = false;
            }
            // must be a *new* Date otherwise it is an array of the same object
            between.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
         }
   }

   return between;

   function isValidDateRange(minDate, maxDate) {
      return (offsetDate(minDate) <= offsetDate(maxDate));
   }
}

// returns 2020-01-01T00:00:00.000Z
export function isoDateString(date) {
   const formatted_date = formatDate(date);
   return new Date(formatted_date).toISOString();
}

function splitTime(value) {
   value = value || '00:00';
   let o = {}, time = {};
   ({0:o.time, 1:o.ampm} = ((value && value.split(' ')) || ''));
   ({0:time.hours, 1:time.minutes} = ((o.time && o.time.split(':')) || ''));
   time.ampm = o.ampm;
   return time;
}

export function militaryTime(value, env) {
   let time = splitTime(value || (env && env.schedule.default_time));
   if (time.ampm && time.hours) {
      if (time.ampm.toLowerCase() === 'pm' && parseInt(time.hours) < 12) time.hours = ((time.hours && parseInt(time.hours)) || 0) + 12
      if (time.ampm.toLowerCase() === 'am' && time.hours === '12') time.hours = '00'; 
   }
   let timeString = `${time.hours || '12'}:${time.minutes || '00'}`;
   return timeString.split(':').map(zeroPad).join(':');
}

export function regularTime(value, env) {
   let time = splitTime(value || (env && env.schedule.default_time));
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

export function convertTime(value, env) { return (!env || env.schedule.time24) ? militaryTime(value, env) : regularTime(value, env); }

export function futureDate(days=1) {
   let currentDate = new Date();
   currentDate.setDate(currentDate.getDate() + days);
   return currentDate;
}

export function getWeek(date, dowOffset=2) {
   date = new Date(+date);
   dowOffset = safeParseInt(dowOffset) ? dowOffset : 0;
   var newYear = new Date(date.getFullYear(),0,1);
   var day = newYear.getDay() - dowOffset;
   day = (day >= 0 ? day : day + 7);
   var daynum = Math.floor((date.getTime() - newYear.getTime() - (date.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;

   var weeknum;

   //if the year starts before the middle of a week
   if (day < 4) {
      weeknum = Math.floor((daynum+day-1)/7) + 1;
      if (weeknum > 52) {
         let nYear = new Date(date.getFullYear() + 1,0,1);
         let nday = nYear.getDay() - dowOffset;
         nday = nday >= 0 ? nday : nday + 7;
         weeknum = nday < 4 ? 1 : 53;
      }
   } else {
      weeknum = Math.floor((daynum+day-1)/7);
   }
   return weeknum;

};

function safeParseInt(value) {
   let result = parseInt(value);
   return isNaN(result) ? undefined : result;
};

export function timeSort(a, b) {
   let as = splitTime(a);
   let bs = splitTime(b);
   if (parseInt(as.hours) < parseInt(bs.hours)) return -1;
   if (parseInt(as.hours) > parseInt(bs.hours)) return 1;
   if (as.hours === bs.hours) {
      if (parseInt(as.minutes) < parseInt(bs.minutes)) return -1;
      if (parseInt(as.minutes) > parseInt(bs.minutes)) return 1;
   }
   return 0;
};

export function weekDays(date) {
   let dates = [0, 1, 2, 3, 4, 5, 6].map(i => dayOfWeek(date, i));
   return dates;

   function dayOfWeek(date, index) {
     let d = new Date(date);
     let day = d.getDay();
     let diff = index - day;
     return new Date(d.setDate(d.getDate() + diff));
   }
};

export function addWeek(date) { let now = new Date(date); return now.setDate(now.getDate() + 7); };
export function subtractWeek(date) { let now = new Date(date); return now.setDate(now.getDate() - 7); };
export function getDateByWeek(week, year) {
   let d = new Date(year, 0, 1);
   let dayNum = d.getDay();
   let requiredDate = --week * 7;
   if (((dayNum !== 0) || dayNum > 4)) requiredDate += 7;
   d.setDate(1 - d.getDay() + ++requiredDate );
   return d;
}

export function validDate(datestring, range) {
   if (!datestring) return false;
   let dateparts = formatDate(datestring).split('-');
   if (isNaN(dateparts.join(''))) return false;
   if (dateparts.length !== 3) return false;
   if (dateparts[0].length !== 4) return false;
   if (+dateparts[1] > 12 || +dateparts[1] < 1) return false;
   if (+dateparts[2] > 31 || +dateparts[2] < 1) return false;
   if (range && range.start) { if (offsetDate(datestring) < offsetDate(range.start)) return false; }
   if (range && range.end) { if (offsetDate(datestring) > offsetDate(range.end)) return false; }
   if (new Date(datestring) === 'Invalid Date') return false;
   return true;
};

export function dateFromDay(year, day) {
  var date = new Date(year, 0); // initialize a date in `year-01-01`
  return new Date(date.setDate(day)); // add the number of days
};

export function ymd2date(ymd) {
   let parts = ymd.split('-');
   if (!parts || parts.length !== 3) return new Date(ymd);
   if (isNaN(parseInt(parts[1]))) return new Date(ymd);
   return new Date(parts[0], parseInt(parts[1]) - 1, parts[2]);
}

export function timeToDate(time, date=null) {
  let [hours, minutes] = (time || '00:00').split(':');
  return date
  ? new Date(date).setHours(hours, minutes, 0, 0)
  : new Date().setHours(hours, minutes, 0, 0);
}

function zeroPad(number) { return number.toString()[1] ? number : "0" + number; }

export const dateTime = {
   convertTime, DateHHMM, formatDate, offsetDate, offsetTime, futureDate,
   currentUTCDate, getDateByWeek, ymd2date, timeUTC
};

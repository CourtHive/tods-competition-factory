import { sameDay, timeStringMinutes } from '../../../../../utilities/dateTime';

export function getTimeBoundary({ startTime, endTime, scheduleDate, courts }) {
  const accessor = startTime ? 'startTime' : endTime ? 'endTime' : undefined;
  return courts.reduce((boundaryTime, court) => {
    const dateAvailability = court.dateAvailability?.find(
      // if no date is specified consider it to be default for all tournament dates
      (availability) =>
        !availability.date || sameDay(scheduleDate, availability.date)
    );
    const comparisonStartTime = dateAvailability?.[accessor] || court[accessor];

    return comparisonStartTime &&
      (!boundaryTime ||
        (startTime
          ? timeStringMinutes(comparisonStartTime) <
            timeStringMinutes(boundaryTime)
          : timeStringMinutes(comparisonStartTime) >
            timeStringMinutes(boundaryTime)))
      ? comparisonStartTime
      : boundaryTime;
  }, undefined);
}

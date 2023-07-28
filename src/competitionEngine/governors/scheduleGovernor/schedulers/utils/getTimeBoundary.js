import { getCourtDateAvailability } from '../../garman/getCourtDateAvailability';
import { timeStringMinutes } from '../../../../../utilities/dateTime';

export function getDateTimeBoundary({
  scheduleDate,
  startTime,
  endTime,
  courts,
}) {
  const accessor =
    (startTime && 'startTime') || (endTime && 'endTime') || undefined;
  return courts.reduce((boundaryTime, court) => {
    const dateAvailability = getCourtDateAvailability({
      date: scheduleDate,
      court,
    });

    const comparisonTime = dateAvailability?.[accessor] || court[accessor];

    return comparisonTime &&
      (!boundaryTime ||
        (startTime &&
          timeStringMinutes(comparisonTime) <
            timeStringMinutes(boundaryTime)) ||
        timeStringMinutes(comparisonTime) > timeStringMinutes(boundaryTime))
      ? comparisonTime
      : boundaryTime;
  }, undefined);
}

export function getCourtsTimeBoundary({ startTime, endTime, courts }) {
  return courts.reduce((boundaryTime, court) => {
    const comparisonTime = getCourtTimeBoundary({ startTime, endTime, court });
    return comparisonTime &&
      (!boundaryTime ||
        (startTime &&
          timeStringMinutes(comparisonTime) <
            timeStringMinutes(boundaryTime)) ||
        timeStringMinutes(comparisonTime) > timeStringMinutes(boundaryTime))
      ? comparisonTime
      : boundaryTime;
  }, undefined);
}

export function getCourtTimeBoundary({ startTime, endTime, court }) {
  const accessor =
    (startTime && 'startTime') || (endTime && 'endTime') || undefined;
  return court.dateAvailability?.reduce((boundary, availability) => {
    const candidate = availability?.[accessor];

    if (!candidate) return boundary;
    if (!boundary) return candidate;

    if (startTime) {
      if (timeStringMinutes(candidate) < timeStringMinutes(boundary))
        boundary = candidate;
    } else {
      if (timeStringMinutes(boundary) > timeStringMinutes(candidate))
        boundary = candidate;
    }

    return boundary;
  }, undefined);
}

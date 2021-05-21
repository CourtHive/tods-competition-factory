import { isValidDateString } from '../../utilities/dateTime';

export function validSchedulingProfile({ venueIds, schedulingProfile }) {
  if (!Array.isArray(schedulingProfile)) return false;
  const isValid = schedulingProfile.every((dateSchedule) => {
    const { scheduleDate, venues } = dateSchedule;
    if (!isValidDateString(scheduleDate)) {
      return false;
    }
    const validVenues = venues.every((venueProfile) => {
      const { venueId, rounds } = venueProfile;
      if (typeof venueId !== 'string') {
        return false;
      }
      if (!Array.isArray(rounds)) {
        return false;
      }
      if (!venueIds.includes(venueId)) {
        return false;
      }
      return true;
    });
    return validVenues;
  });
  return isValid;
}

import { findCourt } from 'src/tournamentEngine/getters/courtGetter';
import { SUCCESS } from 'src/constants/resultConstants';

export function modifyCourtAvailability({tournamentRecord, courtId, dates, availability}) {
  let { court } = findCourt({tournamentRecord, courtId});

  // first strip out existing availability for given dates
  court.dateAvailability = court.dateAvailability.filter(availability => {
    return !dates.includes(availability.date);
  });

  court.dateAvailability = court.dateAvailability.concat(...availability);

  return SUCCESS;
}

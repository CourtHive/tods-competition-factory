import { findCourt } from '../../getters/courtGetter';
import { SUCCESS } from '../../../constants/resultConstants';

export function modifyCourtAvailability({
  tournamentRecord,
  courtId,
  dates,
  availability,
}) {
  const { court } = findCourt({ tournamentRecord, courtId });

  // first strip out existing availability for given dates
  court.dateAvailability = court.dateAvailability.filter(availability => {
    return !dates.includes(availability.date);
  });

  court.dateAvailability = court.dateAvailability.concat(...availability);

  return SUCCESS;
}

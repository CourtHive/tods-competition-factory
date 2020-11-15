import { COURT_NOT_FOUND } from '../../constants/errorConditionConstants';
import { makeDeepCopy } from '../../utilities';

export function findCourt({ tournamentRecord, courtId }) {
  let court, venue;

  (tournamentRecord.venues || []).forEach(venueRecord => {
    (venueRecord.courts || []).forEach(courtRecord => {
      if (courtRecord.courtId === courtId) {
        court = courtRecord;
        venue = venueRecord;
      }
    });
  });

  return (court && { court, venue }) || { error: COURT_NOT_FOUND };
}

export function getCourts({ tournamentRecord, venueId, venueIds }) {
  const courts = (tournamentRecord.venues || [])
    .filter(venue => {
      if (venueId) return venue.venueId === venueId;
      if (venueIds) return venueIds.includes(venue.venueId);
      if (!venueId && !venueIds) return true;
      return false;
    })
    .map(venue => {
      const { venueId } = venue;
      const venueCourts = makeDeepCopy(venue.courts || []);
      venueCourts.forEach(court => Object.assign(court, { venueId }));
      return venueCourts;
    })
    .flat();

  return { courts };
}

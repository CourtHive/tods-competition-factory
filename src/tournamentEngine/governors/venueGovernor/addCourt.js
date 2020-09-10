import { UUID, generateRange, makeDeepCopy } from '../../../utilities';
import { findVenue } from '../../getters/venueGetter';
import { courtTemplate } from '../../generators/courtTemplate';

import { SUCCESS } from '../../../constants/resultConstants';

export function addCourt({ tournamentRecord, venueId, court }) {
  const { venue } = findVenue({ tournamentRecord, venueId });
  if (!venue) return { error: 'Venue Not Found' };

  if (!venue.courts) venue.courts = [];

  const courtRecord = Object.assign({}, courtTemplate(), court);
  if (!courtRecord.courtId) {
    courtRecord.courtId = UUID();
  }

  const courtExists = venue.courts.reduce((exists, candidate) => {
    return exists || candidate.courtId === courtRecord.courtId;
  }, undefined);

  if (!courtExists) {
    venue.courts.push(courtRecord);
    const court = Object.assign({}, makeDeepCopy(courtRecord), { venueId });
    return Object.assign({}, { court }, SUCCESS);
  } else {
    return { error: 'Court Exists' };
  }
}

export function addCourts({
  tournamentRecord,
  venueId,
  courtsCount,
  courtNames = [],
  dateAvailability = [],
}) {
  if (!venueId) return { error: 'Missing venueId' };
  if (!courtsCount || !courtNames) return { error: 'Count not specified' };

  courtsCount = courtsCount || courtNames.length;
  const courts = generateRange(0, courtsCount).map(i => {
    const court = {
      courtName: courtNames[i] || `Court ${i + 1}`,
      dateAvailability,
    };
    return court;
  });

  const result = courts.map(court =>
    addCourt({ tournamentRecord, venueId, court })
  );
  const courtRecords = result.map(outcome => outcome.court).filter(f => f);

  if (courtRecords.length === courtsCount) {
    return Object.assign({}, { courts: courtRecords }, SUCCESS);
  } else {
    return Object.assign({}, { courts: courtRecords }, { error: result });
  }
}

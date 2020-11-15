import { UUID, generateRange, makeDeepCopy } from '../../../utilities';
import { findVenue } from '../../getters/venueGetter';
import { courtTemplate } from '../../generators/courtTemplate';

import {
  MISSING_VENUE_ID,
  MISSING_COURTS_INFO,
  VENUE_NOT_FOUND,
  COURT_EXISTS,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function addCourt({ tournamentRecord, venueId, court }) {
  const { venue } = findVenue({ tournamentRecord, venueId });
  if (!venue) return { error: VENUE_NOT_FOUND };

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
    return { error: COURT_EXISTS };
  }
}

export function addCourts({
  tournamentRecord,
  venueId,
  courtsCount,
  courtNames = [],
  dateAvailability = [],
}) {
  if (!venueId) return { error: MISSING_VENUE_ID };
  if (!courtsCount || !courtNames) return { error: MISSING_COURTS_INFO };

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

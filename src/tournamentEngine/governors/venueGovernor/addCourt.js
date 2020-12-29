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
import { validDateAvailability } from './dateAvailability';

/**
 *
 * @param {string} venueId
 * @param {object} court - court object
 * { courtId, courtName, altitude, latitude, longitude, surfaceCategory, surfaceType, surfaceDate, dateAvailability, onlineResources, courtDimensions, notes }
 */
export function addCourt({ tournamentRecord, venueId, court }) {
  const { venue } = findVenue({ tournamentRecord, venueId });
  if (!venue) return { error: VENUE_NOT_FOUND };

  if (!venue.courts) venue.courts = [];

  const courtRecord = Object.assign({}, courtTemplate(), { venueId });
  if (!courtRecord.courtId) {
    courtRecord.courtId = UUID();
  }

  const courtExists = venue.courts.reduce((exists, candidate) => {
    return exists || candidate.courtId === courtRecord.courtId;
  }, undefined);

  if (courtExists) {
    return { error: COURT_EXISTS };
  } else {
    const errors = [];
    Object.keys(courtRecord).forEach((attribute) => {
      if (court[attribute]) {
        if (attribute === 'dateAvailability') {
          const result = validDateAvailability({
            dateAvailability: court[attribute],
          });
          const { valid, error } = result;
          if (valid) {
            courtRecord[attribute] = court[attribute];
          } else {
            error.errors.forEach((error) => errors.push(error));
          }
        } else {
          courtRecord[attribute] = court[attribute];
        }
      }
    });
    venue.courts.push(courtRecord);

    if (errors.length) {
      return { error: { errors } };
    } else {
      const result = Object.assign({}, makeDeepCopy(courtRecord), { venueId });
      return Object.assign({}, { court: result }, SUCCESS);
    }
  }
}

/**
 * @param {string} venueId
 * @param {number} courtsCount - number of courts to add
 * @param {string[]} courtNames - array of names to assign to generated courts
 * @param {object[]} dataAvailability - dataAvailability object
 */
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
  const courts = generateRange(0, courtsCount).map((i) => {
    const court = {
      courtName: courtNames[i] || `Court ${i + 1}`,
      dateAvailability,
    };
    return court;
  });

  const result = courts.map((court) =>
    addCourt({ tournamentRecord, venueId, court })
  );
  const courtRecords = result.map((outcome) => outcome.court).filter((f) => f);

  if (courtRecords.length === courtsCount) {
    return Object.assign({}, { courts: makeDeepCopy(courtRecords) }, SUCCESS);
  } else {
    return Object.assign(
      {},
      { courts: makeDeepCopy(courtRecords) },
      { error: result }
    );
  }
}

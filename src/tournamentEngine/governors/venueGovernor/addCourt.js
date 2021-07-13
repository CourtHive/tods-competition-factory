import { UUID, generateRange, makeDeepCopy } from '../../../utilities';
import { addNotice, getDevContext } from '../../../global/globalState';
import { courtTemplate } from '../../generators/courtTemplate';
import { validDateAvailability } from './dateAvailability';
import { extractDate, extractTime } from '../../../utilities/dateTime';
import { findVenue } from '../../getters/venueGetter';

import {
  MISSING_VENUE_ID,
  MISSING_COURTS_INFO,
  VENUE_NOT_FOUND,
  COURT_EXISTS,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { MODIFY_VENUE } from '../../../constants/topicConstants';

/**
 *
 * @param {string} venueId
 * @param {object} court - court object
 * { courtId, courtName, altitude, latitude, longitude, surfaceCategory, surfaceType, surfaceDate, dateAvailability, onlineResources, courtDimensions, notes }
 */
export function addCourt({
  tournamentRecord,
  venueId,
  court,
  disableNotice,
  returnDetails,
}) {
  const { venue } = findVenue({ tournamentRecord, venueId });
  if (!venue) return { error: VENUE_NOT_FOUND };

  if (!venue.courts) venue.courts = [];

  const courtRecord = { ...courtTemplate(), venueId };
  if (!courtRecord.courtId) {
    courtRecord.courtId = UUID();
  }

  const courtExists = venue.courts.reduce((exists, candidate) => {
    return exists || candidate.courtId === courtRecord.courtId;
  }, undefined);

  if (courtExists) {
    return { error: COURT_EXISTS };
  } else {
    // build new dateAvailability object with date/time extraction
    const dateAvailability = (court?.dateAvailability || []).map(
      (availabilty) => ({
        ...availabilty,
        date: extractDate(availabilty.date),
        startTime: extractTime(availabilty.startTime),
        endTime: extractTime(availabilty.endTime),
        bookings: availabilty.bookings?.map(
          ({ startTime, endTime, bookingType }) => ({
            startTime: extractTime(startTime),
            endTime: extractTime(endTime),
            bookingType,
          })
        ),
      })
    );

    for (const attribute of Object.keys(courtRecord)) {
      if (court[attribute]) {
        if (attribute === 'dateAvailability') {
          const result = validDateAvailability({ dateAvailability });
          const { valid, error } = result;
          if (valid) {
            courtRecord.dateAvailability = dateAvailability;
          } else {
            if (error) return { error };
          }
        } else {
          courtRecord[attribute] = court[attribute];
        }
      }
    }
    venue.courts.push(courtRecord);

    if (!disableNotice) {
      addNotice({ topic: MODIFY_VENUE, payload: { venue } });
    }

    return getDevContext() || returnDetails
      ? {
          ...SUCCESS,
          court: makeDeepCopy(courtRecord),
          venueId,
        }
      : { ...SUCCESS };
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
    addCourt({
      tournamentRecord,
      venueId,
      court,
      disableNotice: true,
      returnDetails: true,
    })
  );
  const courtRecords = result.map((outcome) => outcome.court).filter(Boolean);

  if (courtRecords.length === courtsCount) {
    const { venue } = findVenue({ tournamentRecord, venueId });
    addNotice({ topic: MODIFY_VENUE, payload: { venue } });
    return { ...SUCCESS, courts: makeDeepCopy(courtRecords) };
  } else {
    return Object.assign(
      {},
      { courts: makeDeepCopy(courtRecords) },
      { error: result }
    );
  }
}

import { UUID, generateRange, makeDeepCopy } from '../../../utilities';
import { courtTemplate } from '../../generators/courtTemplate';
import { addNotice } from '../../../global/state/globalState';
import { validDateAvailability } from './dateAvailability';
import { findVenue } from '../../getters/venueGetter';
import { isNumeric } from '../../../utilities/math';
import {
  extractDate,
  extractTime,
  formatDate,
} from '../../../utilities/dateTime';

import { MODIFY_VENUE } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_VENUE_ID,
  MISSING_COURTS_INFO,
  VENUE_NOT_FOUND,
  COURT_EXISTS,
} from '../../../constants/errorConditionConstants';

export function addCourt({
  tournamentRecord,
  disableNotice,
  venueId,
  courtId,
  court,
}) {
  const { venue } = findVenue({ tournamentRecord, venueId });
  if (!venue) return { error: VENUE_NOT_FOUND };

  if (!venue.courts) venue.courts = [];

  const courtRecord = { ...courtTemplate(), venueId, courtId };
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
          if (!result.valid && result.error) return result;
          courtRecord.dateAvailability = dateAvailability;
        } else {
          courtRecord[attribute] = court[attribute];
        }
      }
    }
    venue.courts.push(courtRecord);

    if (!disableNotice) {
      addNotice({
        payload: { venue, tournamentId: tournamentRecord.tournamentId },
        topic: MODIFY_VENUE,
        key: venue.venueId,
      });
    }

    return { ...SUCCESS, court: makeDeepCopy(courtRecord), venueId };
  }
}

export function addCourts({
  dateAvailability = [],
  tournamentRecord,
  courtNames = [],
  courtTimings,
  courtsCount,
  startTime,
  idPrefix,
  courtIds,
  endTime,
  venueId,
  dates,
}) {
  if (!venueId) return { error: MISSING_VENUE_ID };
  if (!isNumeric(courtsCount) || !courtNames)
    return { error: MISSING_COURTS_INFO };

  courtsCount = courtsCount || courtNames.length;
  const courts = generateRange(0, courtsCount).map((i) => {
    const courtTiming = courtTimings?.[i];
    const courtAvailability = courtTiming
      ? dates.map((date) => ({
          date: formatDate(date),
          startTime,
          endTime,
          ...courtTiming,
        }))
      : dateAvailability;

    // when courtTiming is provided, also add default availability
    if (courtTiming && startTime && endTime)
      courtAvailability.push({ startTime, endTime });

    return {
      courtName: courtNames[i] || `Court ${i + 1}`,
      dateAvailability: courtAvailability,
    };
  });

  const result = courts.map((court, i) => {
    const courtId = courtIds?.pop() || (idPrefix && `${idPrefix}-${i + 1}`);
    return addCourt({
      disableNotice: true,
      tournamentRecord,
      courtId,
      venueId,
      court,
    });
  });
  const courtRecords = result.map((outcome) => outcome.court).filter(Boolean);

  if (courtRecords.length === courtsCount) {
    const { venue } = findVenue({ tournamentRecord, venueId });
    addNotice({
      payload: { venue, tournamentId: tournamentRecord.tournamentId },
      topic: MODIFY_VENUE,
      key: venue.venueId,
    });
    return { ...SUCCESS, courts: makeDeepCopy(courtRecords) };
  } else {
    return Object.assign(
      {},
      { courts: makeDeepCopy(courtRecords) },
      { error: result }
    );
  }
}

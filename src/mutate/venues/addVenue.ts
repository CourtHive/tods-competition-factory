import { resolveTournamentRecords } from '../../parameters/resolveTournamentRecords';
import { definedAttributes } from '../../tools/definedAttributes';
import { makeDeepCopy } from '../../tools/makeDeepCopy';
import { addNotice } from '../../global/state/globalState';
import { addExtension } from '../extensions/addExtension';
import { UUID } from '../../tools/UUID';

import { CONTEXT } from '../../constants/extensionConstants';
import { ADD_VENUE } from '../../constants/topicConstants';
import { SUCCESS } from '../../constants/resultConstants';
import { Venue } from '../../types/tournamentTypes';
import {
  ErrorType,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  VENUE_EXISTS,
  INVALID_VALUES,
} from '../../constants/errorConditionConstants';

export function addVenue(params) {
  const { disableNotice, venue, context } = params;
  if (typeof venue !== 'object') return { error: INVALID_VALUES };
  const tournamentRecords = resolveTournamentRecords(params);
  if (!venue.venueId) venue.venueId = UUID();

  let addedVenue;

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = venueAdd({
      disableNotice: true,
      tournamentRecord,
      context,
      venue,
    });
    if (result?.error) return result;
    addedVenue = result.venue;
  }

  if (!disableNotice) {
    addNotice({ topic: ADD_VENUE, payload: { venue } });
  }

  return definedAttributes({ ...SUCCESS, venue: addedVenue });
}

type AddVenueArgs = {
  context?: { [key: string]: any };
  disableNotice?: boolean;
  tournamentRecord: any;
  venue: Venue;
};

function venueAdd({ tournamentRecord, disableNotice, context, venue }: AddVenueArgs): {
  success?: boolean;
  error?: ErrorType;
  venue?: Venue;
  info?: string;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!venue) return { error: MISSING_VALUE, info: 'missing venue' };

  if (!tournamentRecord.venues) tournamentRecord.venues = [];
  if (!venue.venueId) venue.venueId = UUID();

  const venueExists = tournamentRecord.venues.reduce((exists: any, existingVenue) => {
    return exists || existingVenue.venueId === venue.venueId;
  }, undefined);

  if (!venueExists) {
    if (context) {
      const extension = {
        value: context,
        name: CONTEXT,
      };
      addExtension({ element: venue, extension });
    }

    tournamentRecord.venues.push(venue);

    if (!disableNotice) {
      addNotice({
        payload: { venue, tournamentId: tournamentRecord.tournamentId },
        topic: ADD_VENUE,
      });
    }

    return { ...SUCCESS, venue: makeDeepCopy(venue) };
  } else {
    return { error: VENUE_EXISTS };
  }
}

import { addExtension } from '../../../global/functions/producers/addExtension';
import { addNotice } from '../../../global/state/globalState';
import { UUID, makeDeepCopy } from '../../../utilities';

import { CONTEXT } from '../../../constants/extensionConstants';
import { ADD_VENUE } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { Venue } from '../../../types/tournamentFromSchema';
import {
  ErrorType,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  VENUE_EXISTS,
} from '../../../constants/errorConditionConstants';

type AddVenueArgs = {
  context?: { [key: string]: any };
  disableNotice?: boolean;
  tournamentRecord: any;
  venue: Venue;
};

export function addVenue({
  tournamentRecord,
  disableNotice,
  context,
  venue,
}: AddVenueArgs): {
  success?: boolean;
  error?: ErrorType;
  venue?: Venue;
  info?: string;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!venue) return { error: MISSING_VALUE, info: 'missing venue' };

  if (!tournamentRecord.venues) tournamentRecord.venues = [];
  if (!venue.venueId) venue.venueId = UUID();

  const venueExists = tournamentRecord.venues.reduce(
    (exists: any, existingVenue) => {
      return exists || existingVenue.venueId === venue.venueId;
    },
    undefined
  );

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

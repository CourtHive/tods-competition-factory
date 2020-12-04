import venueTemplate from '../../generators/venueTemplate';
import { findVenue } from '../../getters/venueGetter';
import { makeDeepCopy } from '../../../utilities';

import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_VENUE_ID,
  NO_VALID_ATTRIBUTES,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function modifyVenue({ tournamentRecord, venueId, modifications }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!venueId) return { error: MISSING_VENUE_ID };

  const { venue, error } = findVenue({ tournamentRecord, venueId });
  if (error) return { error };

  const validAttributes = Object.keys(venueTemplate()).filter(
    attribute => !['courts'].includes(attribute)
  );

  const validModificationAttributes = Object.keys(
    modifications
  ).filter(attribute => validAttributes.includes(attribute));

  if (!validModificationAttributes.length)
    return { error: NO_VALID_ATTRIBUTES };

  validModificationAttributes.forEach(attribute =>
    Object.assign(venue, { [attribute]: modifications[attribute] })
  );

  return Object.assign({}, SUCCESS, { venue: makeDeepCopy(venue) });
}

/*
{
	"venueName": "test 2",
	"venueAbbreviation": "tst2",
	"courts": [{
		"courtId": "b9df6177-e430-4a70-ba47-9b9ff60258cb",
		"courtName": "Custom Court 1",
		"dateAvailability": [{
			"date": "01/01/2021",
			"startTime": "04:30 pm",
			"endTime": "05:30 pm"
		}, {
			"date": "02/01/2021",
			"startTime": "04:30 pm",
			"endTime": "04:30 pm"
		}]
	}, {
		"courtId": "886068ac-c176-4cd6-be96-768fa895d0c1",
		"courtName": "Custom Court 2",
		"dateAvailability": [{
			"date": "01/01/2021",
			"startTime": "04:30 pm",
			"endTime": "05:30 pm"
		}, {
			"date": "02/01/2021",
			"startTime": "04:30 pm",
			"endTime": "04:30 pm"
		}]
	}]
}
*/

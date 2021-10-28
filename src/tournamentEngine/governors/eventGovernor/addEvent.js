import tieFormatDefaults from '../../generators/tieFormatDefaults';

import { tieFormats } from '../../../fixtures/scoring/tieFormats';
import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES, TEAM } from '../../../constants/eventConstants';
import { UUID } from '../../../utilities';
import {
  EVENT_EXISTS,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function addEvent({ tournamentRecord, event }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.events) tournamentRecord.events = [];

  // set default startDate, endDate based on tournamentRecord
  const { startDate, endDate } = tournamentRecord;

  const eventRecord = Object.assign(
    {},
    { startDate, endDate, eventType: SINGLES },
    event
  );

  if (
    event.eventType === TEAM &&
    event.tieFormatName &&
    tieFormats[event.tieFormatName]
  ) {
    eventRecord.tieFormat = tieFormatDefaults({
      namedFormat: event.tieFormatName,
    });
  }

  if (!eventRecord.eventId) eventRecord.eventId = UUID();

  const eventExists = tournamentRecord.events.reduce((exists, event) => {
    return exists || event.eventId === eventRecord.eventId;
  }, undefined);

  if (!eventExists) {
    tournamentRecord.events.push(eventRecord);
    return { ...SUCCESS, event: eventRecord };
  } else {
    return { error: EVENT_EXISTS };
  }
}

import tieFormatDefaults from '../../assemblies/generators/templates/tieFormatDefaults';
import { addDrawNotice, addMatchUpsNotice } from '../notifications/drawNotifications';
import { allEventMatchUps } from '../../query/matchUps/getAllEventMatchUps';
import { validateTieFormat } from '../../validators/validateTieFormat';
import { definedAttributes } from '../../utilities/definedAttributes';
import { getTopics } from '../../global/state/globalState';
import { UUID } from '../../utilities/UUID';

import { SINGLES_EVENT, TEAM_EVENT } from '../../constants/eventConstants';
import { Event, Tournament } from '../../types/tournamentTypes';
import { ADD_MATCHUPS } from '../../constants/topicConstants';
import { tieFormats } from '../../fixtures/scoring/tieFormats';
import { SUCCESS } from '../../constants/resultConstants';
import {
  EVENT_EXISTS,
  ErrorType,
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';

type AddEventArgs = {
  suppressNotifications?: boolean;
  tournamentRecord: Tournament;
  internalUse?: boolean;
  event: any; // any because eventId need not be present
};
export function addEvent({ suppressNotifications, tournamentRecord, internalUse, event }: AddEventArgs): {
  context?: { [key: string]: any };
  error?: ErrorType;
  event?: Event;
  info?: any;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.events) tournamentRecord.events = [];
  if (!event) return { error: MISSING_EVENT };

  // set default startDate, endDate based on tournamentRecord
  const { startDate, endDate } = tournamentRecord;

  // if not internal use disallow passing entries and drawDefinitions
  if (!internalUse && (event.entries?.length || event.drawDefinitions?.length)) {
    const context = definedAttributes({
      drawDefinitions: !!event.drawDefinitions?.length,
      entries: !!event.entries?.length,
    });
    return {
      info: 'entries/drawDefinitions cannot exist',
      error: INVALID_VALUES,
      context,
    };
  }

  const eventRecord = {
    eventType: SINGLES_EVENT,
    drawDefinitions: [],
    entries: [],
    startDate,
    endDate,
    ...event,
  };

  if (event.eventType === TEAM_EVENT) {
    if (event.tieFormat) {
      const result = validateTieFormat({ tieFormat: event.tieFormat });
      if (result.error) return result;
    } else if (event.tieFormatName) {
      if (!tieFormats[event.tieFormatName]) {
        return {
          context: { tieFormatName: event.tieFormatName },
          error: INVALID_VALUES,
        };
      }
      const tieFormat = tieFormatDefaults({
        isMock: tournamentRecord?.isMock,
        namedFormat: event.tieFormatName,
        event,
      });
      eventRecord.tieFormat = tieFormat;
    }
  }

  if (!eventRecord.eventId) eventRecord.eventId = UUID();

  const eventExists = tournamentRecord.events.reduce((exists: any, event) => {
    return exists || event.eventId === eventRecord.eventId;
  }, undefined);

  if (!eventExists) {
    const newEvent = eventRecord as Event;
    tournamentRecord.events.push(newEvent);

    if (!suppressNotifications) {
      const { topics } = getTopics();
      if (topics.includes(ADD_MATCHUPS)) {
        const matchUps = allEventMatchUps({ event }).matchUps ?? [];
        addMatchUpsNotice({
          tournamentId: tournamentRecord?.tournamentId,
          eventId: event.eventId,
          matchUps,
        });
      }

      for (const drawDefinition of event.drawDefinitions || []) {
        addDrawNotice({ drawDefinition });
      }
    }

    return { ...SUCCESS, event: eventRecord };
  } else {
    return { error: EVENT_EXISTS };
  }
}

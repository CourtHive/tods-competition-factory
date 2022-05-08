import tieFormatDefaults from '../../generators/tieFormatDefaults';
import { allEventMatchUps } from '../../getters/matchUpsGetter';
import { getTopics } from '../../../global/state/globalState';
import {
  addDrawNotice,
  addMatchUpsNotice,
} from '../../../drawEngine/notifications/drawNotifications';

import { tieFormats } from '../../../fixtures/scoring/tieFormats';
import { SINGLES, TEAM } from '../../../constants/eventConstants';
import { ADD_MATCHUPS } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { UUID } from '../../../utilities';
import {
  EVENT_EXISTS,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function addEvent({ tournamentRecord, event, suppressNotifications }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.events) tournamentRecord.events = [];
  if (!event) return { error: MISSING_EVENT };

  // set default startDate, endDate based on tournamentRecord
  const { startDate, endDate } = tournamentRecord;

  const eventRecord = Object.assign(
    {},
    { startDate, endDate, eventType: SINGLES, entries: [] },
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

    if (!suppressNotifications) {
      const { topics } = getTopics();
      if (topics.includes(ADD_MATCHUPS)) {
        const { matchUps } = allEventMatchUps({ event });
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

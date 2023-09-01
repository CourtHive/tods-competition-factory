import { validateTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/tieFormatUtilities';
import { allEventMatchUps } from '../../getters/matchUpsGetter/matchUpsGetter';
import tieFormatDefaults from '../../generators/tieFormatDefaults';
import { getTopics } from '../../../global/state/globalState';
import {
  addDrawNotice,
  addMatchUpsNotice,
} from '../../../drawEngine/notifications/drawNotifications';

import { ADD_MATCHUPS } from '../../../constants/topicConstants';
import { tieFormats } from '../../../fixtures/scoring/tieFormats';
import { SUCCESS } from '../../../constants/resultConstants';
import { UUID, definedAttributes } from '../../../utilities';
import {
  EVENT_EXISTS,
  ErrorType,
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import {
  Event,
  Tournament,
  TypeEnum,
} from '../../../types/tournamentFromSchema';

type AddEventArgs = {
  suppressNotifications?: boolean;
  tournamentRecord: Tournament;
  internalUse?: boolean;
  event: any;
};
export function addEvent({
  suppressNotifications,
  tournamentRecord,
  internalUse,
  event,
}: AddEventArgs): {
  error?: ErrorType;
  info?: any;
  context?: any;
  event?: Event;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.events) tournamentRecord.events = [];
  if (!event) return { error: MISSING_EVENT };

  // set default startDate, endDate based on tournamentRecord
  const { startDate, endDate } = tournamentRecord;

  // if not internal use disallow passing entries and drawDefinitions
  if (
    !internalUse &&
    (event.entries?.length || event.drawDefinitions?.length)
  ) {
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

  const eventRecord = Object.assign(
    {},
    {
      drawDefinitions: [],
      eventType: TypeEnum.Singles,
      entries: [],
      startDate,
      endDate,
    },
    event
  );

  if (event.eventType === TypeEnum.Team) {
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
        namedFormat: event.tieFormatName,
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
        const matchUps = allEventMatchUps({ event }).matchUps || [];
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

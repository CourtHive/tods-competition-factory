import { getEventTimeItem } from '../queryGovernor/timeItems';
import { getTournamentInfo } from './getTournamentInfo';
import { getVenueData } from './getVenueData';
import { getDrawData } from './getDrawData';

import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { PUBLISH, STATUS } from '../../../constants/timeItemConstants';

// pass in policyDefinitions for roundNaming and personPrivacy
export function getEventData({ tournamentRecord, event, policyDefinition }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const { eventId } = event;
  const drawDefinitions = event.drawDefinitions || [];
  const drawsData = drawDefinitions.map((drawDefinition) =>
    (({ drawInfo, structures }) => ({
      ...drawInfo,
      structures,
    }))(
      getDrawData({
        tournamentRecord,
        policyDefinition,
        drawDefinition,
        context: { eventId },
      })
    )
  );

  const { tournamentInfo } = getTournamentInfo({ tournamentRecord });
  const venues = tournamentRecord.venues || [];
  const venuesData = venues.map((venue) =>
    (({ venueData }) => ({
      ...venueData,
    }))(
      getVenueData({
        tournamentRecord,
        venueId: venue.venueId,
      })
    )
  );

  const eventInfo = (({
    eventId,
    eventName,
    eventType,
    eventLevel,
    surfaceCategory,
    matchUpFormat,
    category,
    gender,
    startDate,
    endDate,
    ballType,
    discipline,
  }) => ({
    eventId,
    eventName,
    eventType,
    eventLevel,
    surfaceCategory,
    matchUpFormat,
    category,
    gender,
    startDate,
    endDate,
    ballType,
    discipline,
  }))(event);

  const eventData = {
    eventInfo,
    drawsData,
    venuesData,
    tournamentInfo,
  };

  const { timeItem } = getEventTimeItem({
    event,
    itemType: `${PUBLISH}.${STATUS}`,
  });

  eventData.eventInfo.publish = {
    state: timeItem?.itemValue,
    createdAt: timeItem?.createdAt,
  };

  return Object.assign({}, SUCCESS, { eventData });
}

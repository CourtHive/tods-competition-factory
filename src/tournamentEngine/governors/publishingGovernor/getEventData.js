import { getDrawData } from './getDrawData';

import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { getTournamentInfo } from './getTournamentInfo';
import { getVenueData } from './getVenueData';

export function getEventData({ tournamentRecord, event }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const drawDefinitions = event.drawDefinitions || [];
  const drawsData = drawDefinitions.map(drawDefinition =>
    (({ drawInfo, groupedStructures }) => ({
      ...drawInfo,
      groupedStructures,
    }))(
      getDrawData({
        tournamentRecord,
        drawDefinition,
      })
    )
  );

  const { tournamentInfo } = getTournamentInfo({ tournamentRecord });
  const venues = tournamentRecord.venues || [];
  const venuesData = venues.map(venue =>
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
    category,
    gender,
    startDate,
    endDate,
    entries,
    ballType,
    discipline,
  }) => ({
    eventId,
    eventName,
    eventType,
    eventLevel,
    surfaceCategory,
    category,
    gender,
    startDate,
    endDate,
    entries,
    ballType,
    discipline,
  }))(event);

  return Object.assign({}, SUCCESS, {
    eventInfo,
    drawsData,
    venuesData,
    tournamentInfo,
  });
}

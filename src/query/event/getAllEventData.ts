import { getScheduleTiming } from '../extensions/matchUpFormatTiming/getScheduleTiming';
import { getDrawMatchUps } from '../drawMatchUps';
import { getVenuesAndCourts } from '../../tournamentEngine/getters/venueGetter';
import { getTournamentInfo } from '../tournament/getTournamentInfo';

import { MISSING_TOURNAMENT_RECORD } from '../../constants/errorConditionConstants';
import { getEventPublishStatus } from './getEventPublishStatus';

export function getAllEventData({ tournamentRecord, policyDefinitions }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const events = tournamentRecord.events || [];
  const tournamentParticipants = tournamentRecord?.participants || [];

  const { tournamentInfo } = getTournamentInfo({ tournamentRecord });

  const { venues: venuesData } = getVenuesAndCourts({
    tournamentRecord,
  });

  const eventsData = events.map((event) => {
    const { eventId } = event;
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

    const scheduleTiming = getScheduleTiming({
      tournamentRecord,
      event,
    }).scheduleTiming;

    const drawsData = (event.drawDefinitions || []).map((drawDefinition) => {
      const drawInfo = (({ drawId, drawName, matchUpFormat, updatedAt }) => ({
        matchUpFormat,
        updatedAt,
        drawName,
        drawId,
      }))(drawDefinition);

      const {
        abandonedMatchUps,
        completedMatchUps,
        upcomingMatchUps,
        pendingMatchUps,
      } = getDrawMatchUps({
        requireParticipants: true,
        tournamentParticipants,
        context: { eventId },
        policyDefinitions,
        tournamentRecord,
        inContext: true,
        scheduleTiming,
        drawDefinition,
        event,
      });

      return {
        drawInfo,
        matchUps: {
          abandonedMatchUps,
          completedMatchUps,
          upcomingMatchUps,
          pendingMatchUps,
        },
      };
    });

    const publish = getEventPublishStatus({ event });

    Object.assign(eventInfo, {
      drawsData,
      publish,
    });

    return eventInfo;
  });

  const allEventData = { tournamentInfo, venuesData, eventsData };

  return { allEventData };
}

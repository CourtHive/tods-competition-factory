import { getScheduleTiming } from '../scheduleGovernor/matchUpFormatTiming/getScheduleTiming';
import { getDrawMatchUps } from '../../../drawEngine/getters/getMatchUps/drawMatchUps';
import { getVenuesAndCourts } from '../../getters/venueGetter';
import { getEventTimeItem } from '../queryGovernor/timeItems';
import { getTournamentInfo } from './getTournamentInfo';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { PUBLISH, STATUS } from '../../../constants/timeItemConstants';

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
        drawId,
        drawName,
        matchUpFormat,
        updatedAt,
      }))(drawDefinition);

      const {
        pendingMatchUps,
        completedMatchUps,
        upcomingMatchUps,
        abandonedMatchUps,
      } = getDrawMatchUps({
        context: { eventId },
        inContext: true,
        drawDefinition,
        scheduleTiming,
        policyDefinitions,
        tournamentRecord,
        includeByeMatchUps: false,
        requireParticipants: true,
        tournamentParticipants,
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

    const { timeItem } = getEventTimeItem({
      event,
      itemType: `${PUBLISH}.${STATUS}`,
    });

    Object.assign(eventInfo, {
      publish: timeItem?.itemValue,
      drawsData,
    });

    return eventInfo;
  });

  const allEventData = { tournamentInfo, venuesData, eventsData };

  return { allEventData };
}

import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { getEventTimeItem } from '../queryGovernor/timeItems';
import { getTournamentInfo } from './getTournamentInfo';
import { makeDeepCopy } from '../../../utilities';
import { getVenueData } from './getVenueData';
import { getDrawData } from './getDrawData';

import { PUBLISH, STATUS } from '../../../constants/timeItemConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function getEventData({
  participantsProfile,
  policyDefinitions,
  tournamentRecord,
  // usePublishState,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const { eventId } = event;
  const { tournamentId, endDate } = tournamentRecord;

  const { tournamentParticipants } = getTournamentParticipants({
    withGroupings: true,
    withEvents: false,
    withDraws: false,
    withISO: true,
    ...participantsProfile, // order is important!!
    tournamentRecord,
  });

  const drawDefinitions = event.drawDefinitions || [];
  const drawsData = drawDefinitions.map((drawDefinition) =>
    (({ drawInfo, structures }) => ({
      ...drawInfo,
      structures,
    }))(
      getDrawData({
        context: { eventId, tournamentId, endDate },
        tournamentParticipants,
        policyDefinitions,
        tournamentRecord,
        drawDefinition,
        event,
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
    itemType: `${PUBLISH}.${STATUS}`,
    event,
  });

  eventData.eventInfo.publish = {
    state: timeItem?.itemValue,
    createdAt: timeItem?.createdAt,
  };

  return { ...SUCCESS, eventData: makeDeepCopy(eventData) };
}

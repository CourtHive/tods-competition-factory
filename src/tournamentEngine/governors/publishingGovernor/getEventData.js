import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { getEventTimeItem } from '../queryGovernor/timeItems';
import { getTournamentInfo } from './getTournamentInfo';
import { makeDeepCopy } from '../../../utilities';
import { getVenueData } from './getVenueData';
import { getDrawData } from './getDrawData';

import { PUBLIC, PUBLISH, STATUS } from '../../../constants/timeItemConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function getEventData({
  participantsProfile,
  policyDefinitions,
  tournamentRecord,
  usePublishState,
  status = PUBLIC,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const { eventId } = event;
  const { tournamentId, endDate } = tournamentRecord;

  const { timeItem } = getEventTimeItem({
    itemType: `${PUBLISH}.${STATUS}`,
    event,
  });

  const publishStatus = timeItem?.itemValue?.[status];

  const { tournamentParticipants } = getTournamentParticipants({
    withGroupings: true,
    withEvents: false,
    withDraws: false,
    ...participantsProfile, // order is important!!
    tournamentRecord,
  });

  const drawDefinitions = event.drawDefinitions || [];
  const drawsData = drawDefinitions
    .filter(
      (drawDefinition) =>
        !usePublishState ||
        publishStatus?.drawIds?.length === 0 ||
        publishStatus?.drawIds?.includes(drawDefinition.drawId)
    )
    .map((drawDefinition) =>
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

  eventData.eventInfo.publish = {
    state: timeItem?.itemValue,
    createdAt: timeItem?.createdAt,
  };

  return { ...SUCCESS, eventData: makeDeepCopy(eventData) };
}

import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { getEventTimeItem } from '../queryGovernor/timeItems';
import { getTournamentInfo } from './getTournamentInfo';
import { makeDeepCopy } from '../../../utilities';
import { getVenueData } from './getVenueData';
import { getDrawData } from './getDrawData';

import { PUBLIC, PUBLISH, STATUS } from '../../../constants/timeItemConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  ErrorType,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function getEventData(params): {
  success?: boolean;
  eventData?: any;
  error?: ErrorType;
} {
  const {
    includePositionAssignments,
    tournamentRecord: t,
    participantsProfile,
    policyDefinitions,
    usePublishState,
    status = PUBLIC,
    sortConfig,
    event: e,
  } = params;
  const tournamentRecord = makeDeepCopy(t, false, true);
  const event = makeDeepCopy(e, false, true);

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

  const structureFilter = ({ structureId }) =>
    !usePublishState ||
    !publishStatus?.structureIds?.length ||
    publishStatus.structureIds.includes(structureId);

  const drawFilter = ({ drawId }) =>
    !usePublishState ||
    !publishStatus?.drawIds?.length ||
    publishStatus.drawIds.includes(drawId);

  const drawDefinitions = event.drawDefinitions || [];
  const drawsData = drawDefinitions
    .filter(drawFilter)
    .map((drawDefinition) =>
      (({ drawInfo, structures }) => ({
        ...drawInfo,
        structures,
      }))(
        getDrawData({
          context: { eventId, tournamentId, endDate },
          includePositionAssignments,
          tournamentParticipants,
          noDeepCopy: true,
          policyDefinitions,
          tournamentRecord,
          drawDefinition,
          sortConfig,
          event,
        })
      )
    )
    .map(({ structures, ...drawData }) => ({
      ...drawData,
      structures: structures?.filter(structureFilter),
    }))
    .filter((drawData) => drawData.structures?.length);

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

  const eventInfo: any = (({
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
    tournamentInfo,
    venuesData,
    eventInfo,
    drawsData,
  };

  eventData.eventInfo.publish = {
    createdAt: timeItem?.createdAt,
    state: timeItem?.itemValue,
  };

  return { ...SUCCESS, eventData };
}

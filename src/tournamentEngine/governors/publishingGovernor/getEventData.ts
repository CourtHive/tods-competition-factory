import { getParticipants } from '../../getters/participants/getParticipants';
import { getEventTimeItem } from '../queryGovernor/timeItems';
import { getTournamentInfo } from './getTournamentInfo';
import { makeDeepCopy } from '../../../utilities';
import { getVenueData } from './getVenueData';
import { getDrawData } from './getDrawData';

import { PUBLIC, PUBLISH, STATUS } from '../../../constants/timeItemConstants';
import { Event, Tournament } from '../../../types/tournamentFromSchema';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  ParticipantsProfile,
  PolicyDefinitions,
  StructureSortConfig,
} from '../../../types/factoryTypes';
import {
  ErrorType,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

type GetEventDataArgs = {
  participantsProfile?: ParticipantsProfile;
  includePositionAssignments?: boolean;
  policyDefinitions?: PolicyDefinitions;
  sortConfig?: StructureSortConfig;
  tournamentRecord: Tournament;
  usePublishState?: boolean;
  status?: string;
  event: Event;
};

export function getEventData(params: GetEventDataArgs): {
  error?: ErrorType;
  success?: boolean;
  eventData?: any;
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

  const { participants: tournamentParticipants } = getParticipants({
    withGroupings: true,
    withEvents: false,
    withDraws: false,
    ...participantsProfile, // order is important!!
    tournamentRecord,
  });

  const stageFilter = ({ stage }) =>
    !usePublishState ||
    !publishStatus?.stages?.length ||
    publishStatus.stages.includes(stage);

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
      structures: structures?.filter(structureFilter)?.filter(stageFilter),
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

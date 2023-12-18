import { getParticipants } from '../participants/getParticipants';
import { generateRange, makeDeepCopy } from '../../utilities';
import { getEventPublishStatus } from './getEventPublishStatus';
import { isConvertableInteger } from '../../utilities/math';
import { getTournamentInfo } from '../tournament/getTournamentInfo';
import { getVenueData } from '../../tournamentEngine/governors/publishingGovernor/getVenueData';
import { getDrawData } from '../../tournamentEngine/governors/publishingGovernor/getDrawData';

import { Event, Tournament } from '../../types/tournamentTypes';
import { PUBLIC } from '../../constants/timeItemConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  ParticipantsProfile,
  PolicyDefinitions,
  StructureSortConfig,
} from '../../types/factoryTypes';
import {
  ErrorType,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';

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

  const publishStatus = getEventPublishStatus({ event, status });

  const { participants: tournamentParticipants } = getParticipants({
    withGroupings: true,
    withEvents: false,
    withDraws: false,
    ...participantsProfile, // order is important!!
    tournamentRecord,
  });

  const stageFilter = ({ stage, drawId }) => {
    if (!usePublishState) return true;
    const stageDetails = publishStatus?.drawDetails?.[drawId]?.stageDetails;
    if (!stageDetails || !Object.keys(stageDetails).length) return true;
    return stageDetails[stage]?.published;
  };

  const structureFilter = ({ structureId, drawId }) => {
    if (!usePublishState) return true;
    const structureDetails =
      publishStatus?.drawDetails?.[drawId]?.structureDetails;
    if (!structureDetails || !Object.keys(structureDetails).length) return true;
    return structureDetails[structureId]?.published;
  };

  const drawFilter = ({ drawId }) => {
    if (!usePublishState) return true;
    if (publishStatus.drawDetails) {
      return publishStatus.drawDetails[drawId]?.publishingDetail?.published;
    } else if (publishStatus.drawIds) {
      return publishStatus.drawIds.includes(drawId);
    }
    return true;
  };

  const roundLimitMapper = ({ drawId, structure }) => {
    if (!usePublishState) return structure;
    const roundLimit =
      publishStatus?.drawDetails?.[drawId]?.structureDetails?.[
        structure.structureId
      ]?.roundLimit;
    if (isConvertableInteger(roundLimit)) {
      const roundNumbers = generateRange(1, roundLimit + 1);
      const roundMatchUps = {};
      const roundProfile = {};
      for (const roundNumber of roundNumbers) {
        if (structure.roundMatchUps[roundNumber]) {
          roundMatchUps[roundNumber] = structure.roundMatchUps[roundNumber];
          roundProfile[roundNumber] = structure.roundProfile[roundNumber];
        }
      }
      structure.roundMatchUps = roundMatchUps;
      structure.roundProfile = roundProfile;
    }
    return structure;
  };

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
          usePublishState,
          drawDefinition,
          publishStatus,
          sortConfig,
          event,
        })
      )
    )
    .map(({ structures, ...drawData }) => {
      const filteredStructures = structures
        ?.filter(
          ({ stage, structureId }) =>
            structureFilter({ structureId, drawId: drawData.drawId }) &&
            stageFilter({ stage, drawId: drawData.drawId })
        )
        .map((structure) =>
          roundLimitMapper({ drawId: drawData.drawId, structure })
        );
      return {
        ...drawData,
        structures: filteredStructures,
      };
    })
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

  eventData.eventInfo.publish = publishStatus;

  return { ...SUCCESS, eventData };
}

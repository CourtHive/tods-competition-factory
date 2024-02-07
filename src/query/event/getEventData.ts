import { getEventPublishStatus } from '@Query/event/getEventPublishStatus';
import { getTournamentInfo } from '@Query/tournaments/getTournamentInfo';
import { getParticipants } from '@Query/participants/getParticipants';
import { getPublishState } from '@Query/publishing/getPublishState';
import { getDrawData } from '@Query/drawDefinition/getDrawData';
import { getVenueData } from '@Query/venues/getVenueData';
import { isConvertableInteger } from '@Tools/math';
import { makeDeepCopy } from '@Tools/makeDeepCopy';
import { generateRange } from '@Tools/arrays';
import { findEvent } from '@Acquire/findEvent';

// constants and types
import { ParticipantsProfile, PolicyDefinitions, StructureSortConfig } from '@Types/factoryTypes';
import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { EVENT_NOT_FOUND, ErrorType } from '@Constants/errorConditionConstants';
import { getDrawIsPublished } from '@Query/publishing/getDrawIsPublished';
import { Event, Tournament } from '@Types/tournamentTypes';
import { ANY_OF } from '@Constants/attributeConstants';
import { PUBLIC } from '@Constants/timeItemConstants';
import { HydratedParticipant } from '@Types/hydrated';
import { SUCCESS } from '@Constants/resultConstants';

type GetEventDataArgs = {
  participantsProfile?: ParticipantsProfile;
  includePositionAssignments?: boolean;
  policyDefinitions?: PolicyDefinitions;
  allParticipantResults?: boolean;
  sortConfig?: StructureSortConfig;
  tournamentRecord: Tournament;
  usePublishState?: boolean;
  eventId?: string;
  status?: string;
  event?: Event;
};

export function getEventData(params: GetEventDataArgs): {
  participants?: HydratedParticipant[];
  error?: ErrorType;
  success?: boolean;
  eventData?: any;
} {
  const {
    includePositionAssignments,
    participantsProfile,
    policyDefinitions,
    usePublishState,
    status = PUBLIC,
    sortConfig,
  } = params;

  const paramsCheck = checkRequiredParameters(params, [
    { tournamentRecord: true },
    { [ANY_OF]: { event: false, eventId: false } },
  ]);
  if (paramsCheck.error) return paramsCheck;

  const tournamentRecord = makeDeepCopy(params.tournamentRecord, false, true);
  const foundEvent = !params.event ? findEvent({ tournamentRecord, eventId: params.eventId }).event : undefined;
  const event = params.event
    ? makeDeepCopy(params.event, false, true)
    : (foundEvent && makeDeepCopy(foundEvent, false, true)) || undefined;

  if (!event) return { error: EVENT_NOT_FOUND };

  const { eventId } = event;
  const { tournamentId, endDate } = tournamentRecord;

  const publishStatus = getEventPublishStatus({ event, status });
  const publishState = getPublishState({ event }).publishState ?? {};
  const eventPublished = !!publishState?.status?.published;

  const { participants: tournamentParticipants } = getParticipants({
    withGroupings: true,
    withEvents: false,
    withDraws: false,
    policyDefinitions, // necessary here for returning public participant data
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
    const structureDetails = publishStatus?.drawDetails?.[drawId]?.structureDetails;
    if (!structureDetails || !Object.keys(structureDetails).length) return true;
    return structureDetails[structureId]?.published;
  };

  const drawFilter = ({ drawId }) => (!usePublishState ? true : getDrawIsPublished({ publishStatus, drawId }));

  const roundLimitMapper = ({ drawId, structure }) => {
    if (!usePublishState) return structure;
    const roundLimit = publishStatus?.drawDetails?.[drawId]?.structureDetails?.[structure.structureId]?.roundLimit;
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
  const drawsData =
    !usePublishState || eventPublished
      ? drawDefinitions
          .filter(drawFilter)
          .map((drawDefinition) =>
            (({ drawInfo, structures }) => ({
              ...drawInfo,
              structures,
            }))(
              getDrawData({
                allParticipantResults: params.allParticipantResults,
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
              }),
            ),
          )
          .map(({ structures, ...drawData }) => {
            const filteredStructures = structures
              ?.filter(
                ({ stage, structureId }) =>
                  structureFilter({ structureId, drawId: drawData.drawId }) &&
                  stageFilter({ stage, drawId: drawData.drawId }),
              )
              .map((structure) => roundLimitMapper({ drawId: drawData.drawId, structure }));
            return {
              ...drawData,
              structures: filteredStructures,
            };
          })
          .filter((drawData) => drawData.structures?.length)
      : undefined;

  const { tournamentInfo } = getTournamentInfo({ tournamentRecord });
  const venues = tournamentRecord.venues || [];
  const venuesData = venues.map((venue) =>
    (({ venueData }) => ({
      ...venueData,
    }))(
      getVenueData({
        tournamentRecord,
        venueId: venue.venueId,
      }),
    ),
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

  eventData.eventInfo.publishState = publishState;
  eventData.eventInfo.published = publishState?.status?.published;

  return { ...SUCCESS, eventData, participants: tournamentParticipants };
}

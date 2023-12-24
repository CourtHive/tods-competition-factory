import { addEventEntries } from '../../mutate/entries/addEventEntries';
import { publishEvent } from '../../mutate/events/publishEvent';
import tieFormatDefaults from '../../assemblies/generators/templates/tieFormatDefaults';
import { addEvent } from '../../mutate/events/addEvent';
import { attachPolicies } from '../../mutate/extensions/policies/attachPolicies';
import { getStageParticipantsCount } from '../getters/getStageParticipantsCount';
import { generateFlightDrawDefinitions } from './generateFlightDrawDefinitions';
import { generateEventParticipants } from './generateEventParticipants';
import { getStageParticipants } from '../getters/getStageParticipants';
import { addEventTimeItem } from '../../mutate/timeItems/addTimeItem';
import { isValidExtension } from '../../validators/isValidExtension';
import { UUID, extractAttributes } from '../../utilities';
import { generateFlights } from './generateFlights';

import { SINGLES, DOUBLES, TEAM } from '../../constants/eventConstants';
import { INDIVIDUAL, PAIR } from '../../constants/participantConstants';
import { MAIN } from '../../constants/drawDefinitionConstants';

export function generateEventWithFlights(params) {
  const {
    allUniqueParticipantIds,
    matchUpStatusProfile,
    participantsProfile,
    completeAllMatchUps,
    autoEntryPositions,
    hydrateCollections,
    randomWinningSide,
    ratingsParameters,
    tournamentRecord,
    eventProfile,
    eventIndex,
    publish,
    uuids,
  } = params;
  let gender = eventProfile.gender;
  let eventName = eventProfile.eventName;

  const {
    eventType = SINGLES,
    policyDefinitions,
    drawProfiles = [],
    eventExtensions,
    surfaceCategory,
    tieFormatName,
    processCodes,
    discipline,
    eventLevel,
    timeItems,
    ballType,
    category,
  } = eventProfile;

  const eventId = eventProfile.eventId || UUID();
  const tieFormat =
    eventProfile.tieFormat ||
    (eventType === TEAM
      ? tieFormatDefaults({
          namedFormat: tieFormatName,
          event: { eventId, category, gender },
          hydrateCollections,
        })
      : undefined);

  const targetParticipants = tournamentRecord.participants;

  for (const drawProfile of drawProfiles) {
    if (!gender && drawProfile.gender) gender = drawProfile?.gender;
  }

  const {
    stageParticipantsCount,
    uniqueParticipantsCount,
    uniqueParticipantStages,
  } = getStageParticipantsCount({
    drawProfiles,
    category,
    gender,
  });

  const eventParticipantType =
    (eventType === SINGLES && INDIVIDUAL) ||
    (eventType === DOUBLES && PAIR) ||
    eventType;

  const { uniqueDrawParticipants = [], uniqueParticipantIds = [] } =
    uniqueParticipantStages
      ? generateEventParticipants({
          event: { eventType, category, gender },
          uniqueParticipantsCount,
          participantsProfile,
          ratingsParameters,
          tournamentRecord,
          eventProfile,
          eventIndex,
          uuids,
        })
      : {};

  // Create event object -------------------------------------------------------
  let { eventAttributes } = eventProfile;
  if (typeof eventAttributes !== 'object') eventAttributes = {};

  const categoryName =
    category?.categoryName || category?.ageCategoryCode || category?.ratingType;

  eventName = eventName || categoryName || 'Generated Event';

  const newEvent = {
    ...eventAttributes,
    surfaceCategory,
    processCodes,
    discipline,
    eventLevel,
    eventName,
    eventType,
    tieFormat,
    ballType,
    category,
    eventId,
    gender,
  };

  // attach any valid eventExtensions
  if (eventExtensions?.length && Array.isArray(eventExtensions)) {
    const extensions = eventExtensions.filter(isValidExtension);
    if (extensions?.length) Object.assign(newEvent, { extensions });
  }

  if (Array.isArray(timeItems)) {
    timeItems.forEach((timeItem) => addEventTimeItem({ event, timeItem }));
  }

  if (typeof policyDefinitions === 'object') {
    for (const policyType of Object.keys(policyDefinitions)) {
      attachPolicies({
        policyDefinitions: { [policyType]: policyDefinitions[policyType] },
        event: newEvent,
      });
    }
  }

  // only update on event since category is used in participant generation
  if (newEvent.category) newEvent.category.categoryName = categoryName;

  let drawIds;
  const eventResult: any = addEvent({
    suppressNotifications: false,
    internalUse: true,
    tournamentRecord,
    event: newEvent,
  });
  if (eventResult.error) return eventResult;
  const event = eventResult?.event;

  // Generate Flights ---------------------------------------------------------
  const { stageParticipants } = getStageParticipants({
    allUniqueParticipantIds,
    stageParticipantsCount,
    eventParticipantType,
    targetParticipants,
  });

  if (drawProfiles?.length) {
    const flightResult = generateFlights({
      uniqueDrawParticipants,
      autoEntryPositions,
      stageParticipants,
      tournamentRecord,
      drawProfiles,
      category,
      gender,
      event,
    });
    if (flightResult.error) return flightResult;

    const drawDefinitionResult = generateFlightDrawDefinitions({
      matchUpStatusProfile,
      completeAllMatchUps,
      randomWinningSide,
      tournamentRecord,
      drawProfiles,
      event,
    });
    if (drawDefinitionResult.error) return drawDefinitionResult;
    drawIds = drawDefinitionResult.drawIds;
  } else if (eventProfile?.participantsProfile?.participantsCount) {
    const eventParticipantIds = uniqueDrawParticipants.map(
      extractAttributes('participantId')
    );

    if (eventParticipantIds.length) {
      const result = addEventEntries({
        participantIds: eventParticipantIds,
        autoEntryPositions,
        tournamentRecord,
        entryStage: MAIN,
        event,
      });
      if (result.error) return result;
    }
  }

  if (publish) {
    publishEvent({ tournamentRecord, event });
  }

  return { drawIds, eventId, uniqueParticipantIds };
}

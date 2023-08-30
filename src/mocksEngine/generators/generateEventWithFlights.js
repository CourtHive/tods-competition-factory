import { attachEventPolicies } from '../../tournamentEngine/governors/policyGovernor/policyManagement';
import { addEventTimeItem } from '../../tournamentEngine/governors/tournamentGovernor/addTimeItem';
import { publishEvent } from '../../tournamentEngine/governors/publishingGovernor/publishEvent';
import tieFormatDefaults from '../../tournamentEngine/generators/tieFormatDefaults';
import { addEvent } from '../../tournamentEngine/governors/eventGovernor/addEvent';
import { getStageParticipantsCount } from '../getters/getStageParticipantsCount';
import { generateFlightDrawDefinitions } from './generateFlightDrawDefinitions';
import { isValidExtension } from '../../global/validation/isValidExtension';
import { generateEventParticipants } from './generateEventParticipants';
import { getStageParticipants } from '../getters/getStageParticipants';
import { generateFlights } from './generateFlights';
import { UUID } from '../../utilities';

import { SINGLES, DOUBLES, TEAM } from '../../constants/eventConstants';
import { INDIVIDUAL, PAIR } from '../../constants/participantConstants';

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
    discipline,
    eventLevel,
    timeItems,
    ballType,
    category,
  } = eventProfile;

  const tieFormat =
    eventProfile.tieFormat ||
    (eventType === TEAM
      ? tieFormatDefaults({
          namedFormat: tieFormatName,
          event: { category, gender },
          hydrateCollections,
        })
      : undefined);

  let targetParticipants = tournamentRecord.participants;

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

  const eventId = eventProfile.eventId || UUID();

  eventName = eventName || categoryName || 'Generated Event';

  const newEvent = {
    ...eventAttributes,
    surfaceCategory,
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
      attachEventPolicies({
        policyDefinitions: { [policyType]: policyDefinitions[policyType] },
        event: newEvent,
      });
    }
  }

  // only update on event since category is used in participant generation
  if (newEvent.category) newEvent.category.categoryName = categoryName;

  let result = addEvent({
    suppressNotifications: false,
    internalUse: true,
    tournamentRecord,
    event: newEvent,
  });
  if (result.error) return result;
  const { event } = result;

  // Generate Flights ---------------------------------------------------------
  const { stageParticipants } = getStageParticipants({
    allUniqueParticipantIds,
    stageParticipantsCount,
    eventParticipantType,
    targetParticipants,
  });

  result = generateFlights({
    uniqueDrawParticipants,
    autoEntryPositions,
    stageParticipants,
    tournamentRecord,
    drawProfiles,
    category,
    gender,
    event,
  });
  if (result.error) return result;

  result = generateFlightDrawDefinitions({
    matchUpStatusProfile,
    completeAllMatchUps,
    randomWinningSide,
    tournamentRecord,
    drawProfiles,
    event,
  });
  if (result.error) return result;

  const drawIds = result.drawIds;

  if (publish) {
    publishEvent({ tournamentRecord, event });
  }

  return { drawIds, eventId, uniqueParticipantIds };
}

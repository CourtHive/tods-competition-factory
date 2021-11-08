// import { addDrawDefinition } from '../../tournamentEngine/governors/eventGovernor/drawDefinitions/addDrawDefinition';
// import { automatedPlayoffPositioning } from '../../tournamentEngine/governors/eventGovernor/automatedPositioning';
// import { setParticipantScaleItem } from '../../tournamentEngine/governors/participantGovernor/addScaleItems';
// import { addPlayoffStructures } from '../../tournamentEngine/governors/eventGovernor/addPlayoffStructures';
import { attachEventPolicies } from '../../tournamentEngine/governors/policyGovernor/policyManagement';
// import { addExtension } from '../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
// import { generateDrawDefinition } from '../../tournamentEngine/generators/generateDrawDefinition';
import tieFormatDefaults from '../../tournamentEngine/generators/tieFormatDefaults';
// import { getFlightProfile } from '../../tournamentEngine/getters/getFlightProfile';
import { addEvent } from '../../tournamentEngine/governors/eventGovernor/addEvent';
import { getStageParticipantsCount } from '../getters/getStageParticipantsCount';
import { generateFlightDrawDefinitions } from './generateFlightDrawDefinitions';
import { isValidExtension } from '../../global/validation/isValidExtension';
import { generateEventParticipants } from './generateEventParticipants';
import { getStageParticipants } from '../getters/getStageParticipants';
// import { getParticipantId } from '../../global/functions/extractors';
// import { hasParticipantId } from '../../global/functions/filters';
// import { completeDrawMatchUps } from './completeDrawMatchUps';
import { /*generateRange,*/ UUID } from '../../utilities';
import { generateFlights } from './generateFlights';

import { SINGLES, DOUBLES, TEAM } from '../../constants/eventConstants';
import { INDIVIDUAL, PAIR } from '../../constants/participantTypes';
// import { SEEDING } from '../../constants/scaleConstants';
// import {
//   MAIN,
//   ROUND_ROBIN_WITH_PLAYOFF,
// } from '../../constants/drawDefinitionConstants';

export function generateEventWithFlights({
  allUniqueParticipantIds,
  matchUpStatusProfile,
  participantsProfile,
  completeAllMatchUps,
  autoEntryPositions,
  randomWinningSide,
  ratingsParameters,
  tournamentRecord,
  eventProfile,
  // startDate,
  uuids,
}) {
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
    ballType,
    category,
  } = eventProfile;

  const tieFormat =
    eventProfile.tieFormat ||
    (eventType === TEAM
      ? tieFormatDefaults({ namedFormat: tieFormatName })
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
    eventType === SINGLES
      ? INDIVIDUAL
      : eventType === DOUBLES
      ? PAIR
      : eventType;

  const { uniqueDrawParticipants = [], uniqueParticipantIds = [] } =
    uniqueParticipantStages
      ? generateEventParticipants({
          event: { eventType, category, gender },
          uniqueParticipantsCount,
          participantsProfile,
          ratingsParameters,
          tournamentRecord,
          eventProfile,
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

  if (typeof policyDefinitions === 'object') {
    for (const policyType of Object.keys(policyDefinitions)) {
      attachEventPolicies({
        policyDefinitions: { [policyType]: policyDefinitions[policyType] },
        event: newEvent,
      });
    }
  }
  let result = addEvent({ tournamentRecord, event: newEvent });
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
    completeAllMatchUps,
    matchUpStatusProfile,
    randomWinningSide,
    tournamentRecord,
    drawProfiles,
    event,
  });
  if (result.error) return result;

  const drawIds = result.drawIds;

  /*
  const drawIds = [];
  const { flightProfile } = getFlightProfile({ event });

  if (Array.isArray(flightProfile?.flights)) {
    for (const [index, flight] of flightProfile.flights.entries()) {
      const { drawId, stage, drawName, drawEntries } = flight;
      drawIds.push(flight.drawId);

      const drawProfile = drawProfiles[index];
      const { seedsCount, generate = true } = drawProfile || {};

      if (generate) {
        const drawParticipantIds = drawEntries
          .filter(hasParticipantId)
          .map(getParticipantId);

        const seedingScaleName = categoryName || eventName;

        if (
          tournamentRecord &&
          seedsCount &&
          seedsCount <= drawParticipantIds.length
        ) {
          const scaleValues = generateRange(1, seedsCount + 1);
          scaleValues.forEach((scaleValue, index) => {
            let scaleItem = {
              scaleValue,
              scaleName: seedingScaleName,
              scaleType: SEEDING,
              eventType,
              scaleDate: startDate,
            };

            const participantId = drawParticipantIds[index];
            setParticipantScaleItem({
              tournamentRecord,
              participantId,
              scaleItem,
            });
          });
        }

        let result = generateDrawDefinition({
          ...drawProfile,
          matchUpType: eventType,
          seedingScaleName,
          tournamentRecord,
          isMock: true,
          drawEntries,
          drawName,
          drawId,
          event,
          stage,
        });

        const { drawDefinition, error } = result;
        if (error) return { error };

        const drawExtensions = drawProfiles[index]?.drawExtensions;
        if (Array.isArray(drawExtensions)) {
          drawExtensions
            .filter(isValidExtension)
            .forEach((extension) =>
              addExtension({ element: drawDefinition, extension })
            );
        }

        result = addDrawDefinition({
          drawDefinition,
          event,
        });
        if (result.error) return result;

        if (drawProfile?.withPlayoffs) {
          const structureId = drawDefinition.structures[0].structureId;
          const result = addPlayoffStructures({
            idPrefix: drawProfile.idPrefix,
            ...drawProfile.withPlayoffs,
            tournamentRecord,
            drawDefinition,
            isMock: true,
            structureId,
            event,
          });
          if (result?.error) return result;
        }

        // TODO: enable { outcomes: [] } in eventProfile: { drawProfiles }

        const manual = drawProfile?.automated === false;
        if (!manual && completeAllMatchUps) {
          const matchUpFormat = drawProfile?.matchUpFormat;
          const result = completeDrawMatchUps({
            matchUpStatusProfile,
            completeAllMatchUps,
            randomWinningSide,
            drawDefinition,
            matchUpFormat,
          });
          if (result.error) return result;
          if (drawProfile?.drawType === ROUND_ROBIN_WITH_PLAYOFF) {
            const mainStructure = drawDefinition.structures.find(
              (structure) => structure.stage === MAIN
            );
            let result = automatedPlayoffPositioning({
              structureId: mainStructure.structureId,
              tournamentRecord,
              drawDefinition,
              event,
            });
            if (result.error) return result;

            result = completeDrawMatchUps({
              completeAllMatchUps,
              matchUpStatusProfile,
              randomWinningSide,
              matchUpFormat,
              drawDefinition,
            });
            if (result.error) return result;
          }
        }
      }
    }
  }
  */

  return { drawIds, eventId, uniqueParticipantIds };
}

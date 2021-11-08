import { addDrawDefinition } from '../../tournamentEngine/governors/eventGovernor/drawDefinitions/addDrawDefinition';
import { automatedPlayoffPositioning } from '../../tournamentEngine/governors/eventGovernor/automatedPositioning';
import { setParticipantScaleItem } from '../../tournamentEngine/governors/participantGovernor/addScaleItems';
import { addPlayoffStructures } from '../../tournamentEngine/governors/eventGovernor/addPlayoffStructures';
import { addEventEntries } from '../../tournamentEngine/governors/eventGovernor/entries/addEventEntries';
import { attachEventPolicies } from '../../tournamentEngine/governors/policyGovernor/policyManagement';
import { addParticipants } from '../../tournamentEngine/governors/participantGovernor/addParticipants';
import { addExtension } from '../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { generateDrawDefinition } from '../../tournamentEngine/generators/generateDrawDefinition';
import { addFlight } from '../../tournamentEngine/governors/eventGovernor/addFlight';
import tieFormatDefaults from '../../tournamentEngine/generators/tieFormatDefaults';
import { getFlightProfile } from '../../tournamentEngine/getters/getFlightProfile';
import { addEvent } from '../../tournamentEngine/governors/eventGovernor/addEvent';
import { getStageParticipantsCount } from '../getters/getStageParticipantsCount';
import { isValidExtension } from '../../global/validation/isValidExtension';
import { getParticipantId } from '../../global/functions/extractors';
import { hasParticipantId } from '../../global/functions/filters';
import { generateParticipants } from './generateParticipants';
import { completeDrawMatchUps } from './completeDrawMatchUps';
import { generateRange, UUID } from '../../utilities';

import { DIRECT_ACCEPTANCE } from '../../constants/entryStatusConstants';
import { SINGLES, DOUBLES, TEAM } from '../../constants/eventConstants';
import { INDIVIDUAL, PAIR } from '../../constants/participantTypes';
import { SEEDING } from '../../constants/scaleConstants';
import {
  MAIN,
  QUALIFYING,
  ROUND_ROBIN_WITH_PLAYOFF,
  SINGLE_ELIMINATION,
} from '../../constants/drawDefinitionConstants';

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
  startDate,
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
  let uniqueDrawParticipants = [];

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

  const uniqueParticipantIds = [];
  if (uniqueParticipantStages) {
    const {
      valuesInstanceLimit,
      nationalityCodesCount,
      nationalityCodeType,
      nationalityCodes,
      addressProps,
      personIds,
      inContext,
    } = participantsProfile || {};
    const mainParticipantsCount = uniqueParticipantsCount[MAIN] || 0;
    const qualifyingParticipantsCount =
      uniqueParticipantsCount[QUALIFYING] || 0;

    const participantsCount =
      mainParticipantsCount + qualifyingParticipantsCount;
    const { participants: uniqueFlightParticipants } = generateParticipants({
      scaledParticipantsCount: eventProfile.scaledParticipantsCount,
      consideredDate: tournamentRecord?.startDate,
      rankingRange: eventProfile.rankingRange,
      participantType: eventParticipantType,
      nationalityCodesCount,
      nationalityCodeType,
      valuesInstanceLimit,
      participantsCount,
      ratingsParameters,
      nationalityCodes,
      addressProps,
      sex: gender,
      personIds,
      inContext,
      category,
      uuids,
    });

    let result = addParticipants({
      tournamentRecord,
      participants: uniqueFlightParticipants,
    });
    if (result.error) return result;

    uniqueDrawParticipants = uniqueFlightParticipants.filter(
      ({ participantType }) => participantType === eventParticipantType
    );
    uniqueFlightParticipants.forEach(({ participantId }) =>
      uniqueParticipantIds.push(participantId)
    );
  }

  const mainParticipantsCount = stageParticipantsCount[MAIN] || 0;
  const qualifyingParticipantsCount = stageParticipantsCount[QUALIFYING] || 0;

  // this is only used for non-unique participants
  const stageParticipants = {
    QUALIFYING: targetParticipants
      .filter(({ participantType }) => participantType === eventParticipantType)
      .filter(
        ({ participantId }) => !allUniqueParticipantIds.includes(participantId)
      )
      .slice(0, qualifyingParticipantsCount),
    MAIN: targetParticipants
      .filter(({ participantType }) => participantType === eventParticipantType)
      .filter(
        ({ participantId }) => !allUniqueParticipantIds.includes(participantId)
      )
      .slice(
        qualifyingParticipantsCount,
        qualifyingParticipantsCount + mainParticipantsCount
      ),
  };

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
        event: newEvent,
        policyDefinitions: { [policyType]: policyDefinitions[policyType] },
      });
    }
  }
  let result = addEvent({ tournamentRecord, event: newEvent });
  if (result.error) return result;

  const { event } = result;

  let uniqueParticipantsIndex = 0;
  for (const drawProfile of drawProfiles) {
    const {
      drawType = SINGLE_ELIMINATION,
      qualifyingPositions = 0,
      uniqueParticipants,
      stage = MAIN,
      drawSize = 0,
      drawName,
      drawId,
    } = drawProfile;

    const entriesCount = drawSize - qualifyingPositions;
    const requiresUniqueParticipants =
      uniqueParticipants || gender || category || stage === QUALIFYING;

    // if a drawProfile has specified uniqueParticipants...
    const drawParticipants = requiresUniqueParticipants
      ? uniqueDrawParticipants.slice(
          uniqueParticipantsIndex,
          uniqueParticipantsIndex + entriesCount
        )
      : stageParticipants[stage || MAIN] || [];

    if (requiresUniqueParticipants) uniqueParticipantsIndex += entriesCount;

    const drawParticipantIds = drawParticipants
      .slice(0, entriesCount)
      .map(getParticipantId);

    if (drawParticipantIds.length) {
      const result = addEventEntries({
        participantIds: drawParticipantIds,
        autoEntryPositions,
        tournamentRecord,
        stage,
        event,
      });
      if (result.error) return result;
    }

    const drawEntries = drawParticipantIds.map((participantId) => ({
      entryStatus: DIRECT_ACCEPTANCE,
      entryStage: stage,
      participantId,
    }));

    const result = addFlight({
      drawName: drawName || drawType,
      qualifyingPositions,
      drawEntries,
      drawId,
      event,
      stage,
    });
    if (result.error) {
      return result;
    }
  }

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

  return { drawIds, eventId, uniqueParticipantIds };
}

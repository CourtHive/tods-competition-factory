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
import { validExtension } from '../../global/validation/validExtension';
import { getParticipantId } from '../../global/functions/extractors';
import { hasParticipantId } from '../../global/functions/filters';
import { generateParticipants } from './generateParticipants';
import { completeDrawMatchUps } from './completeDrawMatchUps';
import { generateRange, UUID } from '../../utilities';

import { DIRECT_ACCEPTANCE } from '../../constants/entryStatusConstants';
import { INDIVIDUAL, PAIR } from '../../constants/participantTypes';
import { SINGLES, DOUBLES, TEAM } from '../../constants/eventConstants';
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
  tournamentRecord,
  eventProfile,
  startDate,
  uuids,
}) {
  let gender = eventProfile.gender;
  const {
    eventName = 'Generated Event',
    eventType = SINGLES,
    policyDefinitions,
    drawProfiles = [],
    eventExtensions,
    surfaceCategory,
    discipline,
    eventLevel,
    ballType,
    category,
  } = eventProfile;

  const tieFormat =
    eventProfile.tieFormat ||
    (eventType === TEAM ? tieFormatDefaults() : undefined);
  let targetParticipants = tournamentRecord.participants;
  let uniqueDrawParticipants = [];

  for (const drawProfile of drawProfiles) {
    if (!gender && drawProfile.gender) gender = drawProfile?.gender;
  }

  let uniqueParticipantsCount = {};
  const stageParticipantsCount = drawProfiles.reduce(
    (stageParticipantsCount, drawProfile) => {
      const {
        qualifyingPositions = 0,
        participantsCount = 0,
        uniqueParticipants,
        stage = MAIN,
        drawSize = 0,
      } = drawProfile || {};

      if (!Object.keys(stageParticipantsCount).includes(stage))
        stageParticipantsCount[stage] = 0;

      const stageCount = participantsCount || drawSize - qualifyingPositions;

      if (uniqueParticipants || gender) {
        if (!Object.keys(uniqueParticipantsCount).includes(stage))
          uniqueParticipantsCount[stage] = 0;
        uniqueParticipantsCount[stage] += stageCount;
      } else {
        stageParticipantsCount[stage] = Math.max(
          stageCount,
          stageParticipantsCount[stage]
        );
      }
      return stageParticipantsCount;
    },
    {}
  );

  const uniqueParticipantStages = Object.keys(uniqueParticipantsCount);
  uniqueParticipantStages.forEach(
    (stage) => (stageParticipantsCount[stage] += uniqueParticipantsCount[stage])
  );

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

    const { participants: uniqueFlightParticipants } = generateParticipants({
      participantsCount: mainParticipantsCount + qualifyingParticipantsCount,
      participantType: eventParticipantType,
      sex: gender,

      uuids,
      valuesInstanceLimit,
      nationalityCodesCount,
      nationalityCodeType,
      nationalityCodes,
      addressProps,
      personIds,

      inContext,
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

  const eventId = eventProfile.eventId || UUID();
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
    const extensions = eventExtensions.filter(validExtension);
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

    // if a drawProfile has specified uniqueParticipants...
    const drawParticipants = uniqueParticipants
      ? uniqueDrawParticipants.slice(uniqueParticipantsIndex, entriesCount)
      : stageParticipants[stage || MAIN] || [];

    if (uniqueParticipants || gender) uniqueParticipantsIndex += entriesCount;

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

        const seedingScaleName =
          event.category?.ageCategoryCode ||
          event.category?.categoryName ||
          eventName;
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
            .filter(validExtension)
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

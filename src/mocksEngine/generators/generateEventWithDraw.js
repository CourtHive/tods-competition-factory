import { addDrawDefinition } from '../../tournamentEngine/governors/eventGovernor/drawDefinitions/addDrawDefinition';
import { automatedPlayoffPositioning } from '../../tournamentEngine/governors/eventGovernor/automatedPositioning';
import { setParticipantScaleItem } from '../../tournamentEngine/governors/participantGovernor/addScaleItems';
import { addPlayoffStructures } from '../../tournamentEngine/governors/eventGovernor/addPlayoffStructures';
import { addEventEntries } from '../../tournamentEngine/governors/eventGovernor/entries/addEventEntries';
import { addExtension } from '../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { addParticipants } from '../../tournamentEngine/governors/participantGovernor/addParticipants';
import { generateDrawDefinition } from '../../tournamentEngine/generators/generateDrawDefinition';
import tieFormatDefaults from '../../tournamentEngine/generators/tieFormatDefaults';
import { allDrawMatchUps } from '../../tournamentEngine/getters/matchUpsGetter';
import { validExtension } from '../../global/validation/validExtension';
import { generateRange, intersection, UUID } from '../../utilities';
import { generateParticipants } from './generateParticipants';
import {
  completeDrawMatchUps,
  completeDrawMatchUp,
} from './completeDrawMatchUps';

import { FORMAT_STANDARD } from '../../fixtures/scoring/matchUpFormats/formatConstants';
import { INDIVIDUAL, PAIR, TEAM } from '../../constants/participantTypes';
import { COMPLETED } from '../../constants/matchUpStatusConstants';
import { SINGLES, DOUBLES } from '../../constants/eventConstants';
import { ALTERNATE } from '../../constants/entryStatusConstants';
import { SEEDING } from '../../constants/timeItemConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  MAIN,
  ROUND_ROBIN_WITH_PLAYOFF,
  SINGLE_ELIMINATION,
} from '../../constants/drawDefinitionConstants';

export function generateEventWithDraw({
  allUniqueParticipantIds = [],
  matchUpStatusProfile,
  participantsProfile,
  completeAllMatchUps,
  autoEntryPositions,
  randomWinningSide,
  tournamentRecord,
  drawProfile,
  startDate,
  goesTo,
  uuids,
}) {
  const {
    excessParticipantAlternates = true,
    matchUpFormat = FORMAT_STANDARD,
    drawType = SINGLE_ELIMINATION,
    eventType = SINGLES,
    alternatesCount = 0,
    eventExtensions,
    drawExtensions,
    drawSize = 32,
    seedsCount,
    category,
    idPrefix,
    gender,
    stage,
  } = drawProfile;

  const tieFormat =
    drawProfile.tieFormat || (eventType === TEAM && tieFormatDefaults());

  let eventName = drawProfile.eventName || `Generated ${eventType}`;
  let targetParticipants = tournamentRecord?.participants || [];

  const participantsCount =
    !drawProfile.participantsCount || drawProfile.participantsCount > drawSize
      ? drawSize
      : drawProfile.participantsCount;

  const eventId = UUID();
  let event = { eventId, eventName, eventType, category, tieFormat };

  let { eventAttributes } = drawProfile;
  if (typeof eventAttributes !== 'object') eventAttributes = {};
  Object.assign(event, eventAttributes);

  // attach any valid eventExtensions
  if (eventExtensions?.length && Array.isArray(eventExtensions)) {
    const extensions = eventExtensions.filter(validExtension);
    if (extensions?.length) Object.assign(event, { extensions });
  }

  const uniqueParticipantIds = [];
  if (drawProfile.uniqueParticipants || !tournamentRecord || gender) {
    const participantType = eventType === DOUBLES ? PAIR : INDIVIDUAL;
    const {
      valuesInstanceLimit,
      nationalityCodesCount,
      nationalityCodeType,
      nationalityCodes,
      addressProps,
      personIds,
      inContext,
    } = participantsProfile || {};
    const { participants: unique } = generateParticipants({
      participantsCount: participantsCount + alternatesCount,
      participantType,

      uuids: drawProfile.uuids || uuids,
      sex: gender || participantsProfile?.sex,
      valuesInstanceLimit,
      nationalityCodesCount,
      nationalityCodeType,
      nationalityCodes,
      addressProps,
      personIds,

      inContext,
    });

    if (tournamentRecord) {
      let result = addParticipants({ tournamentRecord, participants: unique });
      if (result.error) return result;
    }

    unique.forEach(({ participantId }) =>
      uniqueParticipantIds.push(participantId)
    );
    targetParticipants = unique;
  }

  const isEventParticipantType = (participant) => {
    const { participantType } = participant;
    if (eventType === SINGLES && participantType === INDIVIDUAL) return true;
    if (eventType === DOUBLES && participantType === PAIR) return true;
    if (eventType === TEAM && participantType === TEAM) return true;
    return false;
  };

  const isEventGender = (participant) => {
    if (!drawProfile.gender) return true;
    if (participant.person?.sex === drawProfile.gender) return true;
    if (participant.individualParticipants?.[0]?.sex === drawProfile.gender)
      return true;
  };

  const consideredParticipants = targetParticipants
    .filter(isEventParticipantType)
    .filter(isEventGender)
    .filter(
      ({ participantId }) => !allUniqueParticipantIds.includes(participantId)
    );

  const participantIds = consideredParticipants
    .slice(0, participantsCount)
    .map((p) => p.participantId);

  let result = addEventEntries({
    entryStage: stage,
    autoEntryPositions,
    tournamentRecord,
    participantIds,
    event,
  });
  if (result.error) return result;

  // alternates can still be taken from existing participants
  // when unique participants are used for DIRECT_ACCEPTANCE entries
  const alternatesParticipantIds =
    excessParticipantAlternates &&
    tournamentRecord?.participants
      ?.filter(({ participantId }) => !participantIds.includes(participantId))
      .filter(isEventParticipantType)
      .filter(isEventGender)
      .slice(0, alternatesCount || drawSize - participantsCount)
      .map((p) => p.participantId);

  if (alternatesParticipantIds?.length) {
    result = addEventEntries({
      participantIds: alternatesParticipantIds,
      autoEntryPositions: false,
      entryStatus: ALTERNATE,
      tournamentRecord,
      event,
    });
    if (result.error) return { error: result.error };
  }

  // now add seeding information for seedsCount participants
  const seedingScaleName =
    event.category?.ageCategoryCode ||
    event.category?.categoryName ||
    eventName;
  if (tournamentRecord && seedsCount && seedsCount <= participantIds.length) {
    const scaleValues = generateRange(1, seedsCount + 1);
    scaleValues.forEach((scaleValue, index) => {
      let scaleItem = {
        scaleValue,
        scaleName: seedingScaleName,
        scaleType: SEEDING,
        eventType,
        scaleDate: startDate,
      };
      const participantId = participantIds[index];
      setParticipantScaleItem({ tournamentRecord, participantId, scaleItem });
    });
  }

  const { drawDefinition, error: generationError } = generateDrawDefinition({
    ...drawProfile,
    tournamentRecord,
    seedingScaleName,
    matchUpFormat,
    drawType,
    drawSize,
    eventId,
    goesTo,
    event,
  });

  if (generationError) return { error: generationError };

  if (Array.isArray(drawExtensions)) {
    drawExtensions
      .filter(validExtension)
      .forEach((extension) =>
        addExtension({ element: drawDefinition, extension })
      );
  }

  result = addDrawDefinition({ drawDefinition, event });
  const { drawId } = drawDefinition;

  if (drawProfile.withPlayoffs) {
    const structureId = drawDefinition.structures[0].structureId;
    const result = addPlayoffStructures({
      ...drawProfile.withPlayoffs,
      tournamentRecord,
      drawDefinition,
      structureId,
      idPrefix,
    });
    if (result?.error) return result;
  }

  const manual = drawProfile.automated === false;
  if (!manual) {
    if (drawProfile.outcomes) {
      const { matchUps } = allDrawMatchUps({
        event,
        drawDefinition,
        inContext: true,
      });
      for (const outcomeDef of drawProfile.outcomes) {
        const {
          roundNumber,
          drawPositions,
          roundPosition,
          scoreString,
          winningSide,
          stage = MAIN,
          matchUpFormat,
          stageSequence = 1,
          matchUpStatus = COMPLETED,
          matchUpIndex = 0,
          structureOrder, // like a group number; for RR = the order of the structureType: ITEM within structureType: CONTAINER
        } = outcomeDef;
        const structureMatchUpIds = matchUps.reduce((sm, matchUp) => {
          const { structureId, matchUpId } = matchUp;
          if (sm[structureId]) {
            sm[structureId].push(matchUpId);
          } else {
            sm[structureId] = [matchUpId];
          }
          return sm;
        }, {});
        const orderedStructures = Object.assign(
          {},
          ...Object.keys(structureMatchUpIds).map((structureId, index) => ({
            [structureId]: index + 1,
          }))
        );
        const targetMatchUps = matchUps.filter((matchUp) => {
          return (
            (!stage || matchUp.stage === stage) &&
            (!stageSequence || matchUp.stageSequence === stageSequence) &&
            (!roundNumber || matchUp.roundNumber === roundNumber) &&
            (!roundPosition || matchUp.roundPosition === roundPosition) &&
            (!structureOrder ||
              orderedStructures[matchUp.structureId] === structureOrder) &&
            (!drawPositions ||
              intersection(drawPositions, matchUp.drawPositions).length === 2)
          );
        });
        const targetMatchUp = targetMatchUps[matchUpIndex];
        const result = completeDrawMatchUp({
          drawDefinition,
          targetMatchUp,
          matchUpFormat,
          matchUpStatus,
          scoreString,
          winningSide,
          drawId,
        });
        // will not throw errors for BYE matchUps
        if (result?.error) return result;
      }
    }

    if (completeAllMatchUps) {
      const result = completeDrawMatchUps({
        drawDefinition,
        matchUpFormat,
        randomWinningSide,
        completeAllMatchUps,
        matchUpStatusProfile,
      });
      if (result.error) return result;

      if (drawType === ROUND_ROBIN_WITH_PLAYOFF) {
        const mainStructure = drawDefinition.structures.find(
          (structure) => structure.stage === MAIN
        );
        let result = automatedPlayoffPositioning({
          structureId: mainStructure.structureId,
          tournamentRecord,
          drawDefinition,
          event,
        });
        result = completeDrawMatchUps({
          drawDefinition,
          matchUpFormat,
          randomWinningSide,
          completeAllMatchUps,
          matchUpStatusProfile,
        });
        if (result.error) return result;
      }
      // TODO: check if RRWPO & automate & complete
    }
  }

  if (result.error) return { error: result.error };

  return {
    ...SUCCESS,

    uniqueParticipantIds,
    targetParticipants,
    drawDefinition,
    eventId,
    drawId,
    event,
  };
}

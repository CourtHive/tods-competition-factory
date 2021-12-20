import { addDrawDefinition } from '../../tournamentEngine/governors/eventGovernor/drawDefinitions/addDrawDefinition';
import { automatedPlayoffPositioning } from '../../tournamentEngine/governors/eventGovernor/automatedPositioning';
import { setParticipantScaleItem } from '../../tournamentEngine/governors/participantGovernor/addScaleItems';
import { addPlayoffStructures } from '../../drawEngine/governors/structureGovernor/addPlayoffStructures';
import { addEventEntries } from '../../tournamentEngine/governors/eventGovernor/entries/addEventEntries';
import { addExtension } from '../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { addParticipants } from '../../tournamentEngine/governors/participantGovernor/addParticipants';
import { drawMatic } from '../../tournamentEngine/governors/eventGovernor/drawDefinitions/drawMatic';
import { generateDrawDefinition } from '../../tournamentEngine/generators/generateDrawDefinition';
import { publishEvent } from '../../tournamentEngine/governors/publishingGovernor/publishEvent';
import tieFormatDefaults from '../../tournamentEngine/generators/tieFormatDefaults';
import { allDrawMatchUps } from '../../tournamentEngine/getters/matchUpsGetter';
import { isValidExtension } from '../../global/validation/isValidExtension';
import { getParticipantId } from '../../global/functions/extractors';
import { generateRange, intersection, UUID } from '../../utilities';
import { generateParticipants } from './generateParticipants';
import { definedAttributes } from '../../utilities/objects';
import { processTieFormat } from './processTieFormat';
import {
  completeDrawMatchUps,
  completeDrawMatchUp,
} from './completeDrawMatchUps';

import { FORMAT_STANDARD } from '../../fixtures/scoring/matchUpFormats';
import { INDIVIDUAL, PAIR, TEAM } from '../../constants/participantTypes';
import { COMPLETED } from '../../constants/matchUpStatusConstants';
import { SINGLES, DOUBLES } from '../../constants/eventConstants';
import { ALTERNATE } from '../../constants/entryStatusConstants';
import { COMPETITOR } from '../../constants/participantRoles';
import { SEEDING } from '../../constants/timeItemConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  AD_HOC,
  MAIN,
  ROUND_ROBIN_WITH_PLAYOFF,
  SINGLE_ELIMINATION,
} from '../../constants/drawDefinitionConstants';

export function generateEventWithDraw({
  allUniqueParticipantIds = [],
  participantsProfile = {},
  matchUpStatusProfile,
  completeAllMatchUps,
  autoEntryPositions,
  randomWinningSide,
  ratingsParameters,
  tournamentRecord,
  drawProfile,
  startDate,
  drawIndex,
  goesTo,
  uuids,
}) {
  const {
    excessParticipantAlternates = true,
    matchUpFormat = FORMAT_STANDARD,
    drawType = SINGLE_ELIMINATION,
    tournamentAlternates = 0,
    alternatesCount = 0,
    generate = true,
    eventExtensions,
    drawExtensions,
    completionGoal,
    drawSize = 32,
    tieFormatName,
    seedsCount,
    category,
    idPrefix,
    publish,
    gender,
    stage,
  } = drawProfile;

  const eventType = drawProfile.eventType || drawProfile.matchUpType || SINGLES;
  const participantType = eventType === DOUBLES ? PAIR : INDIVIDUAL;

  const tieFormat =
    typeof drawProfile.tieFormat === 'object'
      ? drawProfile.tieFormat
      : eventType === TEAM
      ? tieFormatDefaults({ namedFormat: tieFormatName })
      : undefined;

  const categoryName =
    category?.categoryName || category?.ageCategoryCode || category?.ratingType;

  let eventName =
    drawProfile.eventName || categoryName || `Generated ${eventType}`;
  let targetParticipants = tournamentRecord?.participants || [];

  /*
  const qualifyingIndividualParticipantsCount =
    (params.qualifyingProfiles?.reduce(
      (count, profile) => count + profile.drawSize,
      0
    ) || 0) * (participantType === DOUBLES ? 2 : 1);
  console.log({ qualifyingIndividualParticipantsCount });
  */

  const participantsCount =
    !drawProfile.participantsCount || drawProfile.participantsCount > drawSize
      ? drawSize
      : drawProfile.participantsCount;

  const eventId = UUID();
  let event = { eventName, eventType, tieFormat, category, eventId };

  let { eventAttributes } = drawProfile;
  if (typeof eventAttributes !== 'object') eventAttributes = {};
  Object.assign(event, eventAttributes);

  // attach any valid eventExtensions
  if (eventExtensions?.length && Array.isArray(eventExtensions)) {
    const extensions = eventExtensions.filter(isValidExtension);
    if (extensions?.length) Object.assign(event, { extensions });
  }

  const uniqueParticipantIds = [];
  if (
    drawProfile.uniqueParticipants ||
    !tournamentRecord ||
    gender ||
    category
  ) {
    let individualParticipantsCount = participantsCount + alternatesCount;
    let teamSize;

    if (eventType === TEAM) {
      ({ teamSize } = processTieFormat({
        alternatesCount,
        tieFormatName,
        tieFormat,
        drawSize,
      }));
      individualParticipantsCount = teamSize * drawSize;
    }

    const idPrefix = participantsProfile?.idPrefix
      ? `D-${drawIndex}-${participantsProfile?.idPrefix}`
      : undefined;
    const { participants: unique } = generateParticipants({
      ...participantsProfile,
      scaledParticipantsCount: drawProfile.scaledParticipantsCount,
      participantsCount: individualParticipantsCount,
      consideredDate: tournamentRecord?.startDate,
      sex: gender || participantsProfile?.sex,
      rankingRange: drawProfile.rankingRange,
      uuids: drawProfile.uuids || uuids,
      ratingsParameters,
      participantType,
      idPrefix,
      category,
    });

    if (tournamentRecord) {
      const result = addParticipants({
        tournamentRecord,
        participants: unique,
      });
      if (result.error) return result;
    }

    unique.forEach(({ participantId }) =>
      uniqueParticipantIds.push(participantId)
    );
    targetParticipants = unique;

    if (eventType === TEAM) {
      const allIndividualParticipantIds = unique
        .filter(({ participantType }) => participantType === INDIVIDUAL)
        .map(getParticipantId);
      const teamParticipants = generateRange(0, drawSize).map((teamIndex) => {
        const individualParticipantIds = allIndividualParticipantIds.slice(
          teamIndex * teamSize,
          (teamIndex + 1) * teamSize
        );
        return {
          participantName: `Team ${teamIndex + 1}`,
          participantOtherName: `TM${teamIndex + 1}`,
          participantRole: COMPETITOR,
          participantType: TEAM,
          participantId: UUID(),
          individualParticipantIds,
        };
      });
      const result = addParticipants({
        participants: teamParticipants,
        tournamentRecord,
      });
      if (!result.success) return result;
      targetParticipants = teamParticipants;
    }
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
    if (
      participant.individualParticipantIds?.some((participantId) => {
        const individualParticipant = targetParticipants.find(
          (p) => p.participantId === participantId
        );
        return individualParticipant && isEventGender(individualParticipant);
      })
    )
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

  if (participantIds?.length) {
    const result = addEventEntries({
      autoEntryPositions,
      entryStage: stage,
      tournamentRecord,
      participantIds,
      event,
    });
    if (result.error) return result;
  }

  // alternates can still be taken from existing participants
  // when unique participants are used for DIRECT_ACCEPTANCE entries
  const alternatesParticipantIds =
    excessParticipantAlternates &&
    tournamentRecord?.participants
      ?.filter(({ participantId }) => !participantIds.includes(participantId))
      .filter(isEventParticipantType)
      .filter(isEventGender)
      .slice(
        0,
        alternatesCount || drawSize - participantsCount || tournamentAlternates
      )
      .map((p) => p.participantId);

  if (alternatesParticipantIds?.length) {
    const result = addEventEntries({
      participantIds: alternatesParticipantIds,
      autoEntryPositions: false,
      entryStatus: ALTERNATE,
      tournamentRecord,
      event,
    });
    if (result.error) return { error: result.error };
  }

  // now add seeding information for seedsCount participants
  const seedingScaleName = categoryName || eventName;
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
    isMock: true,
    eventId,
    goesTo,
    event,
  });

  if (generationError) return { error: generationError };
  const drawId = generate ? drawDefinition.drawId : undefined;

  if (Array.isArray(drawExtensions)) {
    drawExtensions
      .filter(isValidExtension)
      .forEach((extension) =>
        addExtension({ element: drawDefinition, extension })
      );
  }

  if (generate) {
    addDrawDefinition({ drawDefinition, event });

    if (drawType === AD_HOC && drawProfile.drawMatic) {
      const roundsCount = drawProfile.roundsCount || 1;
      for (const roundNumber of generateRange(1, roundsCount + 1)) {
        const result = drawMatic({
          generateMatchUps: true,
          tournamentRecord,
          drawDefinition,
          roundNumber, // this is not a real parameter
        });
        if (result.error) return result;
      }
    }

    if (drawProfile.withPlayoffs) {
      const structureId = drawDefinition.structures[0].structureId;
      const result = addPlayoffStructures({
        ...drawProfile.withPlayoffs,
        tournamentRecord,
        drawDefinition,
        isMock: true,
        structureId,
        idPrefix,
        event,
      });
      if (result?.error) return result;
    }

    const manual = drawProfile.automated === false;
    if (!manual) {
      if (completeAllMatchUps || completionGoal) {
        const result = completeDrawMatchUps({
          matchUpStatusProfile,
          completeAllMatchUps,
          randomWinningSide,
          tournamentRecord,
          completionGoal,
          drawDefinition,
          matchUpFormat,
          event,
        });
        if (result.error) return result;
        const completedCount = result.completedCount;

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
          // ignore when positioning cannot occur because of incomplete source structure

          const playoffCompletionGoal = completionGoal
            ? completionGoal - completedCount
            : undefined;
          result = completeDrawMatchUps({
            completionGoal: completionGoal ? playoffCompletionGoal : undefined,
            matchUpStatusProfile,
            completeAllMatchUps,
            randomWinningSide,
            tournamentRecord,
            drawDefinition,
            matchUpFormat,
            event,
          });
          if (result.error) return result;
        }
        // TODO: check if RRWPO & automate & complete
      }

      if (drawProfile.outcomes) {
        const { matchUps } = allDrawMatchUps({
          drawDefinition,
          inContext: true,
          event,
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
            matchUpStatusCodes,
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

          // targeting only one matchUp, specified by the index in the array of returned matchUps
          const targetMatchUp = targetMatchUps[matchUpIndex];

          const result = completeDrawMatchUp({
            matchUpStatusCodes,
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
    }

    if (publish) {
      publishEvent({ tournamentRecord, event });
    }
  }

  return {
    ...SUCCESS,

    event: definedAttributes(event),
    uniqueParticipantIds,
    targetParticipants,
    drawDefinition,
    eventId,
    drawId,
  };
}

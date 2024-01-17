import { automatedPlayoffPositioning } from '../../../mutate/drawDefinitions/automatedPlayoffPositioning';
import { addPlayoffStructures } from '../../../mutate/drawDefinitions/addPlayoffStructures';
import { setParticipantScaleItem } from '../../../mutate/participants/addScaleItems';
import { completeDrawMatchUps, completeDrawMatchUp } from './completeDrawMatchUps';
import { addDrawDefinition } from '../../../mutate/drawDefinitions/addDrawDefinition';
import { generateDrawDefinition } from '../drawDefinitions/generateDrawDefinition';
import { addParticipants } from '../../../mutate/participants/addParticipants';
import { checkRequiredParameters } from 'parameters/checkRequiredParameters';
import { allDrawMatchUps } from '../../../query/matchUps/getAllDrawMatchUps';
import { addEventEntries } from '../../../mutate/entries/addEventEntries';
import { addEventTimeItem } from '../../../mutate/timeItems/addTimeItem';
import { generateRange, intersection } from '../../../utilities/arrays';
import { isValidExtension } from '../../../validators/isValidExtension';
import { getParticipantId } from '../../../global/functions/extractors';
import { definedAttributes } from '../../../utilities/definedAttributes';
import { addExtension } from '../../../mutate/extensions/addExtension';
import { publishEvent } from '../../../mutate/events/publishEvent';
import tieFormatDefaults from '../templates/tieFormatDefaults';
import { makeDeepCopy } from '../../../utilities/makeDeepCopy';
import { generateParticipants } from './generateParticipants';
import { addFlight } from '../../../mutate/events/addFlight';
import { processTieFormat } from './processTieFormat';
import { coerceEven } from '../../../utilities/math';
import { UUID } from '../../../utilities/UUID';

import { DRAW_DEFINITION_NOT_FOUND, STRUCTURE_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { INDIVIDUAL, PAIR, TEAM } from '../../../constants/participantConstants';
import { FORMAT_STANDARD } from '../../../fixtures/scoring/matchUpFormats';
import { COMPLETED } from '../../../constants/matchUpStatusConstants';
import { SINGLES, DOUBLES } from '../../../constants/eventConstants';
import { ALTERNATE } from '../../../constants/entryStatusConstants';
import { FEMALE, MALE } from '../../../constants/genderConstants';
import { COMPETITOR } from '../../../constants/participantRoles';
import { SEEDING } from '../../../constants/timeItemConstants';
import { Participant } from '../../../types/tournamentTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import { OBJECT } from 'constants/attributeConstants';
import {
  MAIN,
  QUALIFYING,
  ROUND_ROBIN_WITH_PLAYOFF,
  SINGLE_ELIMINATION,
} from '../../../constants/drawDefinitionConstants';

export function generateEventWithDraw(params) {
  const paramsCheck = checkRequiredParameters(params, [{ drawProfile: true, _ofType: OBJECT }]);
  if (paramsCheck.error) return paramsCheck;

  const {
    allUniqueParticipantIds = [],
    participantsProfile = {},
    matchUpStatusProfile,
    completeAllMatchUps,
    autoEntryPositions,
    hydrateCollections,
    randomWinningSide,
    ratingsParameters,
    tournamentRecord,
    isMock = true,
    drawProfile,
    startDate,
    drawIndex,
    uuids,
  } = params;

  const drawProfileCopy = makeDeepCopy(drawProfile, false, true);

  const {
    excessParticipantAlternates = true,
    matchUpFormat = FORMAT_STANDARD,
    drawType = SINGLE_ELIMINATION,
    tournamentAlternates = 0,
    alternatesCount = 0,
    qualifyingPositions,
    qualifyingProfiles,
    generate = true,
    eventExtensions,
    drawExtensions,
    completionGoal,
    tieFormatName,
    seedsCount,
    timeItems,
    drawName,
    category,
    idPrefix,
    publish,
    gender,
    stage,
  } = drawProfileCopy;

  const drawSize = drawProfileCopy.drawSize || (drawProfileCopy.ignoreDefaults ? undefined : 32);

  const eventId = drawProfileCopy.eventId || UUID();
  const eventType = drawProfile.eventType || drawProfile.matchUpType || SINGLES;
  const participantType = eventType === DOUBLES ? PAIR : INDIVIDUAL;

  const tieFormat =
    (typeof drawProfile.tieFormat === 'object' && drawProfile.tieFormat) ||
    (eventType === TEAM &&
      tieFormatDefaults({
        event: { eventId, category, gender },
        namedFormat: tieFormatName,
        hydrateCollections,
        isMock,
      })) ||
    undefined;

  const categoryName = category?.categoryName || category?.ageCategoryCode || category?.ratingType;

  const eventName = drawProfile.eventName || categoryName || `Generated ${eventType}`;
  let targetParticipants = tournamentRecord?.participants || [];

  const qualifyingParticipantsCount =
    (qualifyingProfiles
      ?.map((profile) => profile.structureProfiles || [])
      .flat() // in case each profile contains an array of stageSequences
      .reduce((count, profile) => {
        const qpc =
          !profile.participantsCount || profile.participantsCount > profile.drawSize
            ? profile.drawSize
            : profile.participantsCount || 0;
        return count + qpc;
      }, 0) || 0) * (participantType === PAIR ? 2 : 1);

  const participantsCount =
    (!drawProfile.participantsCount || drawProfile.participantsCount > drawSize
      ? drawSize
      : drawProfile.participantsCount) || 0;

  // TODO: implement use of tieFormats and tieFormatId
  const event = { eventName, eventType, tieFormat, category, eventId, gender };

  if (Array.isArray(timeItems)) {
    timeItems.forEach((timeItem) => addEventTimeItem({ event, timeItem }));
  }

  let { eventAttributes } = drawProfile;
  if (typeof eventAttributes !== 'object') eventAttributes = {};
  Object.assign(event, eventAttributes);

  // attach any valid eventExtensions
  if (eventExtensions?.length && Array.isArray(eventExtensions)) {
    const extensions = eventExtensions.filter(isValidExtension);
    if (extensions?.length) Object.assign(event, { extensions });
  }

  const uniqueParticipantIds: string[] = [];
  if (qualifyingParticipantsCount || drawProfile.uniqueParticipants || !tournamentRecord || gender || category) {
    const drawParticipantsCount = (participantsCount || 0) + alternatesCount + qualifyingParticipantsCount;
    let individualParticipantCount = drawParticipantsCount;
    const gendersCount = { [MALE]: 0, [FEMALE]: 0 };
    let teamSize, genders;

    if (eventType === TEAM) {
      ({ teamSize, genders } = processTieFormat({
        alternatesCount,
        tieFormatName,
        tieFormat,
        drawSize,
      }));
      Object.keys(genders).forEach((key) => {
        if ([MALE, FEMALE].includes(key) && genders[key]) {
          gendersCount[key] = drawSize * genders[key];
        }
      });
      individualParticipantCount = teamSize * ((drawSize || 0) + qualifyingParticipantsCount);
    }

    const idPrefix = participantsProfile?.idPrefix ? `D-${drawIndex}-${participantsProfile?.idPrefix}` : undefined;

    const result = generateParticipants({
      ...participantsProfile,
      scaledParticipantsCount: drawProfile.scaledParticipantsCount || participantsProfile.scaledParticipantsCount,
      participantsCount: individualParticipantCount,
      consideredDate: tournamentRecord?.startDate,
      sex: gender || participantsProfile?.sex,
      rankingRange: drawProfile.rankingRange,
      uuids: drawProfile.uuids || uuids,
      ratingsParameters,
      participantType,
      gendersCount,
      idPrefix,
      category,
    });
    const unique = result.participants as Participant[];

    // update categoryName **after** generating participants
    if (event.category) event.category.categoryName = categoryName;

    if (tournamentRecord) {
      const result = addParticipants({
        participants: unique,
        tournamentRecord,
      });
      if (result.error) return result;
    }

    unique.forEach(({ participantId }) => uniqueParticipantIds.push(participantId));
    targetParticipants = unique;

    if (eventType === TEAM) {
      const maleIndividualParticipantIds = genders[MALE]
        ? unique
            .filter(({ participantType, person }) => participantType === INDIVIDUAL && person?.sex === MALE)
            .map(getParticipantId)
        : [];
      const femaleIndividualParticipantIds = genders[FEMALE]
        ? unique
            .filter(({ participantType, person }) => participantType === INDIVIDUAL && person?.sex === FEMALE)
            .map(getParticipantId)
        : [];
      const remainingParticipantIds = unique
        .filter(({ participantType }) => participantType === INDIVIDUAL)
        .map(getParticipantId)
        .filter(
          (participantId) =>
            !maleIndividualParticipantIds.includes(participantId) &&
            !femaleIndividualParticipantIds.includes(participantId),
        );

      const mixedCount = teamSize - (genders[MALE] + genders[FEMALE]);
      // use indices to keep track of positions within pId arrays
      let fIndex = 0,
        mIndex = 0,
        rIndex = 0;
      const teamParticipants = generateRange(0, drawParticipantsCount).map((teamIndex) => {
        const fPIDs = femaleIndividualParticipantIds.slice(fIndex, fIndex + genders[FEMALE]);
        const mPIDs = maleIndividualParticipantIds.slice(mIndex, mIndex + genders[MALE]);
        const rIDs = remainingParticipantIds.slice(rIndex, rIndex + mixedCount);
        fIndex += genders[FEMALE];
        mIndex += genders[MALE];
        rIndex += mixedCount;

        return {
          individualParticipantIds: [...fPIDs, ...mPIDs, ...rIDs],
          participantOtherName: `TM${teamIndex + 1}`,
          participantName: `Team ${teamIndex + 1}`,
          participantRole: COMPETITOR,
          participantType: TEAM,
          participantId: UUID(),
        };
      });
      const result = addParticipants({
        participants: teamParticipants as Participant[],
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
    return eventType === TEAM && participantType === TEAM;
  };

  const isEventGender = (participant) => {
    if (!drawProfile.gender) return true;
    if (participant.person?.sex === drawProfile.gender) return true;
    return participant.individualParticipantIds?.some((participantId) => {
      const individualParticipant = targetParticipants.find((p) => p.participantId === participantId);
      return individualParticipant && isEventGender(individualParticipant);
    });
  };

  const consideredParticipants = targetParticipants
    .filter(isEventParticipantType)
    .filter(isEventGender)
    .filter(({ participantId }) => !allUniqueParticipantIds.includes(participantId));

  const participantIds = consideredParticipants.slice(0, participantsCount).map((p) => p.participantId);

  if (isMock && participantIds?.length) {
    const result = addEventEntries({
      autoEntryPositions,
      entryStage: stage,
      tournamentRecord,
      participantIds,
      event,
    });
    if (result.error) return result;
  }

  const qualifyingParticipantIds = qualifyingParticipantsCount
    ? consideredParticipants
        .slice(participantsCount, participantsCount + qualifyingParticipantsCount)
        .map((p) => p.participantId)
    : 0;

  if (isMock && qualifyingParticipantIds?.length) {
    let qualifyingIndex = 0; // used to take slices of participants array
    let roundTarget = 1;

    const sequenceSort = (a, b) => a.stageSequence - b.stageSequence;
    const roundTargetSort = (a, b) => a.roundTarget - b.roundTarget;

    for (const roundTargetProfile of qualifyingProfiles.sort(roundTargetSort)) {
      roundTarget = roundTargetProfile.roundTarget || roundTarget;
      let entryStageSequence = 1;
      let qualifyingPositions;

      for (const structureProfile of roundTargetProfile.structureProfiles.sort(sequenceSort)) {
        const drawSize = structureProfile.drawSize || coerceEven(structureProfile.participantsCount);
        const participantsCount = drawSize - (qualifyingPositions || 0); // minus qualifyingPositions
        const participantIds = qualifyingParticipantIds.slice(qualifyingIndex, qualifyingIndex + participantsCount);
        const result = addEventEntries({
          entryStage: QUALIFYING,
          entryStageSequence,
          autoEntryPositions,
          tournamentRecord,
          participantIds,
          roundTarget,
          event,
        });

        if (result.error) {
          return result;
        }

        qualifyingPositions = structureProfile.qualifyingPositions;
        qualifyingIndex += participantsCount;
        entryStageSequence += 1;
      }

      roundTarget += 1;
    }
  }

  // alternates can still be taken from existing participants
  // when unique participants are used for DIRECT_ACCEPTANCE entries
  const alternatesParticipantIds =
    excessParticipantAlternates &&
    tournamentRecord?.participants
      ?.filter(({ participantId }) => !participantIds.includes(participantId))
      .filter(isEventParticipantType)
      .filter(isEventGender)
      .slice(0, alternatesCount || drawSize - participantsCount || tournamentAlternates)
      .map((p) => p.participantId);

  if (isMock && alternatesParticipantIds?.length) {
    const result = addEventEntries({
      participantIds: alternatesParticipantIds,
      autoEntryPositions: false,
      entryStatus: ALTERNATE,
      tournamentRecord,
      event,
    });
    if (result.error) return result.error;
  }

  // now add seeding information for seedsCount participants
  const seedingScaleName = categoryName || eventName;
  if (tournamentRecord && seedsCount && seedsCount <= participantIds.length) {
    const scaleValues = generateRange(1, seedsCount + 1);
    scaleValues.forEach((scaleValue, index) => {
      const scaleItem = {
        scaleName: seedingScaleName,
        scaleDate: startDate,
        scaleType: SEEDING,
        scaleValue,
        eventType,
      };
      const participantId = participantIds[index];
      setParticipantScaleItem({ tournamentRecord, participantId, scaleItem });
    });
  }

  const result = generateDrawDefinition({
    ...makeDeepCopy(drawProfile, false, true),
    tournamentRecord,
    seedingScaleName,
    matchUpFormat,
    eventId,
    isMock,
    event,
  });

  if (result.error) return result;
  if (!result.drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };

  const { drawDefinition } = result;
  const drawId = drawDefinition.drawId;

  if (Array.isArray(drawExtensions)) {
    drawExtensions
      .filter(isValidExtension)
      .forEach((extension) => addExtension({ element: drawDefinition, extension }));
  }

  if (generate) {
    addDrawDefinition({ drawDefinition, event, suppressNotifications: true });

    if (drawProfile.withPlayoffs) {
      const structureId = drawDefinition.structures?.[0].structureId;
      const result = addPlayoffStructures({
        ...drawProfile.withPlayoffs,
        tournamentRecord,
        drawDefinition,
        structureId,
        idPrefix,
        isMock,
        event,
      });
      if (result?.error) return result;
    }

    const manual = drawProfile.automated === false;
    if (isMock && !manual) {
      // NOTE: completionGoal needs to come before outcomes array because setMatchUpStatus has integrity checks
      // ... which may require positionAssignments and/or drawPositions to have been propagated
      const goComplete = (p) => {
        const result = completeDrawMatchUps({
          completeAllMatchUps: p.completeAllMatchUps,
          completionGoal: p.completionGoal,
          matchUpStatusProfile,
          // qualifyingProfiles,
          randomWinningSide,
          tournamentRecord,
          drawDefinition,
          matchUpFormat,
          event,
        });
        if (result.error) return result;
        const completedCount = result.completedCount;

        if (drawType === ROUND_ROBIN_WITH_PLAYOFF) {
          const mainStructure = drawDefinition.structures?.find((structure) => structure.stage === MAIN);
          if (!mainStructure) return { error: STRUCTURE_NOT_FOUND };

          automatedPlayoffPositioning({
            structureId: mainStructure.structureId,
            tournamentRecord,
            drawDefinition,
            event,
          });
          // ignore when positioning cannot occur because of incomplete source structure

          const playoffCompletionGoal = completionGoal ? completionGoal - (completedCount ?? 0) : undefined;
          const result = completeDrawMatchUps({
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
        return undefined;
      };

      // NOTE: completionGoal implies something less than "all matchUps"
      // ==> do this first with the assumption that any outcomes must come after
      if (completionGoal) goComplete({ completionGoal });

      if (drawProfile.outcomes) {
        const { matchUps } = allDrawMatchUps({
          inContext: true,
          drawDefinition,
          event,
        });
        for (const outcomeDef of drawProfile.outcomes) {
          const {
            matchUpStatus = COMPLETED,
            matchUpStatusCodes,
            stageSequence = 1,
            matchUpIndex = 0,
            structureOrder, // like a group number; for RR = the order of the structureType: ITEM within structureType: CONTAINER
            matchUpFormat,
            drawPositions,
            roundPosition,
            stage = MAIN,
            roundNumber,
            winningSide,
            scoreString,
          } = outcomeDef;

          const structureMatchUpIds =
            matchUps?.reduce((sm, matchUp) => {
              const { structureId, matchUpId } = matchUp;
              if (sm[structureId]) {
                sm[structureId].push(matchUpId);
              } else {
                sm[structureId] = [matchUpId];
              }
              return sm;
            }, {}) ?? [];

          const orderedStructures = Object.assign(
            {},
            ...Object.keys(structureMatchUpIds).map((structureId, index) => ({
              [structureId]: index + 1,
            })),
          );

          const targetMatchUps = matchUps?.filter((matchUp) => {
            return (
              (!stage || matchUp.stage === stage) &&
              (!stageSequence || matchUp.stageSequence === stageSequence) &&
              (!roundNumber || matchUp.roundNumber === roundNumber) &&
              (!roundPosition || matchUp.roundPosition === roundPosition) &&
              (!structureOrder || orderedStructures[matchUp.structureId] === structureOrder) &&
              (!drawPositions || intersection(drawPositions, matchUp.drawPositions).length === 2)
            );
          });

          // targeting only one matchUp, specified by the index in the array of returned matchUps
          const targetMatchUp = targetMatchUps?.[matchUpIndex];

          const result = completeDrawMatchUp({
            matchUpStatusCodes,
            tournamentRecord,
            drawDefinition,
            targetMatchUp,
            matchUpFormat,
            matchUpStatus,
            scoreString,
            winningSide,
          });
          // will not throw errors for BYE matchUps
          if (result?.error) return result;
        }
      }

      // NOTE: do this last => complete any matchUps which have not already been completed
      if (completeAllMatchUps) goComplete({ completeAllMatchUps });
    }

    if (publish) {
      publishEvent({ tournamentRecord, event });
    }
  } else {
    const result = addFlight({
      drawEntries: drawDefinition.entries,
      drawName: drawName || drawType,
      qualifyingPositions,
      drawId,
      event,
      stage,
    });
    if (result.error) {
      return result;
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

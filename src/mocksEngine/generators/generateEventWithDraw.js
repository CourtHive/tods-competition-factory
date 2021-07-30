import { addDrawDefinition } from '../../tournamentEngine/governors/eventGovernor/drawDefinitions/addDrawDefinition';
import { setParticipantScaleItem } from '../../tournamentEngine/governors/participantGovernor/addScaleItems';
import { addEventEntries } from '../../tournamentEngine/governors/eventGovernor/entries/addEventEntries';
import { generateDrawDefinition } from '../../tournamentEngine/generators/generateDrawDefinition';
import { addEvent } from '../../tournamentEngine/governors/eventGovernor/addEvent';
import { allDrawMatchUps } from '../../tournamentEngine/getters/matchUpsGetter';
import { completeDrawMatchUps, completeMatchUp } from './completeDrawMatchUps';
import { tournamentEngine } from '../../tournamentEngine/sync';
import { generateRange, intersection } from '../../utilities';
import { utilities } from '../..';

import { FORMAT_STANDARD } from '../../fixtures/scoring/matchUpFormats/formatConstants';
import { INDIVIDUAL, PAIR, TEAM } from '../../constants/participantTypes';
import { COMPLETED } from '../../constants/matchUpStatusConstants';
import { SINGLES, DOUBLES } from '../../constants/eventConstants';
import { ALTERNATE } from '../../constants/entryStatusConstants';
import { SEEDING } from '../../constants/timeItemConstants';
import {
  MAIN,
  ROUND_ROBIN_WITH_PLAYOFF,
  SINGLE_ELIMINATION,
} from '../../constants/drawDefinitionConstants';

export function generateEventWithDraw({
  tournamentRecord,
  completeAllMatchUps,
  randomWinningSide,
  participants,
  drawProfile,
  startDate,
  goesTo,
}) {
  const {
    category,
    eventType = SINGLES,
    eventName = 'Generated Event',
    matchUpFormat = FORMAT_STANDARD,
    drawType = SINGLE_ELIMINATION,
    structureOptions,
    drawSize = 32,
    tieFormat,
    feedPolicy,
    automated,
    stage,
  } = drawProfile;

  // let tournamentRecord = tournamentEngine.getState();

  let { participantsCount, seedsCount } = drawProfile;
  if (!participantsCount || participantsCount > drawSize)
    participantsCount = drawSize;

  const eventId = utilities.UUID();
  const newEvent = { eventId, eventName, eventType, category, tieFormat };

  let result = addEvent({ tournamentRecord, event: newEvent });
  if (result.error) return { error: result.error };

  const { event } = result;

  const isEventParticipantType = (participant) => {
    const { participantType } = participant;
    if (eventType === SINGLES && participantType === INDIVIDUAL) return true;
    if (eventType === DOUBLES && participantType === PAIR) return true;
    if (eventType === TEAM && participantType === TEAM) return true;
    return false;
  };
  const participantIds = participants
    .filter(isEventParticipantType)
    .slice(0, participantsCount)
    .map((p) => p.participantId);

  result = addEventEntries({
    event,
    tournamentRecord,
    participantIds,
    entryStage: stage,
    autoEntryPositions: false,
  });
  if (result.error) return { error: result.error };

  const alternatesParticipantIds = participants
    .filter(isEventParticipantType)
    .slice(participantsCount)
    .map((p) => p.participantId);
  if (alternatesParticipantIds.length) {
    result = addEventEntries({
      event,
      tournamentRecord,
      entryStatus: ALTERNATE,
      participantIds: alternatesParticipantIds,
      autoEntryPositions: false,
    });
    if (result.error) return { error: result.error };
  }

  tournamentEngine.setState(tournamentRecord);

  // now add seeding information for seedsCount participants
  const seedingScaleName =
    event.category?.ageCategoryCode ||
    event.category?.categoryName ||
    eventName;
  if (seedsCount && seedsCount < participantIds.length) {
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
    seedingScaleName,
    structureOptions,
    matchUpFormat,
    seedsCount,
    feedPolicy,
    tieFormat,
    automated,
    drawType,
    drawSize,
    eventId,
    goesTo,
    event,
    stage,
  });

  if (generationError) return { error: generationError };
  result = addDrawDefinition({ drawDefinition, event });
  const { drawId } = drawDefinition;

  const manual = automated === false;
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
        const result = completeMatchUp({
          drawDefinition,
          targetMatchUp,
          scoreString,
          winningSide,
          matchUpStatus,
          outcomeDef,
          matchUpFormat,
          drawId,
        });
        if (result.error) return result;
      }
    }

    if (completeAllMatchUps) {
      const result = completeDrawMatchUps({
        drawDefinition,
        matchUpFormat,
        randomWinningSide,
      });
      if (result.error) return result;

      if (drawType === ROUND_ROBIN_WITH_PLAYOFF) {
        const mainStructure = drawDefinition.structures.find(
          (structure) => structure.stage === MAIN
        );
        tournamentEngine.automatedPlayoffPositioning({
          drawId,
          structureId: mainStructure.structureId,
        });
        const result = completeDrawMatchUps({
          tournamentEngine,
          drawId,
          matchUpFormat,
          randomWinningSide,
        });
        if (result.error) return result;
      }
      // TODO: check if RRWPO & automate & complete
    }
  }

  if (result.error) return { error: result.error };

  return { drawId, eventId };
}

import { completeDrawMatchUps, completeMatchUp } from './completeDrawMatchUps';
import { tournamentEngine } from '../../tournamentEngine/sync';
import { generateParticipants } from './generateParticipants';
import { intersection } from '../../utilities';

import { FORMAT_STANDARD } from '../../fixtures/scoring/matchUpFormats/formatConstants';
import { INDIVIDUAL, PAIR, TEAM } from '../../constants/participantTypes';
import {
  MAIN,
  SINGLE_ELIMINATION,
} from '../../constants/drawDefinitionConstants';
import { SINGLES, DOUBLES } from '../../constants/eventConstants';
import { ALTERNATE } from '../../constants/entryStatusConstants';
import { COMPLETED } from '../../constants/matchUpStatusConstants';

/**
 *
 * Generate a complete tournamentRecord from the following attributes
 *
 * @param {string} startDate - optional - ISO string date
 * @param {string} endDate - optional - ISO string date
 * @param {object} participantsProfile - { participantsCount, participantType }
 * @param {object[]} drawProfiles - [{ category, drawSize, drawType, eventType, matchUpFormat }]
 * @param {object[]} outcomes - [{ roundNumber, roundPosition, scoreString, winningSide, ... }]
 *
 */
export function generateTournamentRecord({
  endDate,
  startDate,

  participantsProfile,
  drawProfiles,

  completeAllMatchUps,
  randomWinningSide,
  inContext,
  goesTo,
}) {
  let { participantsCount = 32, participantType = INDIVIDUAL } =
    participantsProfile || {};

  const {
    addressProps,
    nationalityCodes,
    nationalityCodesCount,
    valuesInstanceLimit,

    sex,
  } = participantsProfile || {};

  tournamentEngine.newTournamentRecord({ startDate, endDate });

  const maxDrawSize =
    Math.max(
      ...(drawProfiles || []).map((drawProfile) => drawProfile.drawSize)
    ) || 32;
  const doublesEvents = drawProfiles?.find(
    (drawProfile) => drawProfile.eventType === DOUBLES
  );
  const doublesFactor = doublesEvents ? 2 : 1;
  const minPartcipantsCount = maxDrawSize * doublesFactor;

  if (doublesEvents) participantType = PAIR;
  if (participantsCount < minPartcipantsCount)
    participantsCount = minPartcipantsCount;
  if (participantType === PAIR) participantsCount = participantsCount / 2;

  const { participants } = generateParticipants({
    nationalityCodesCount,
    nationalityCodes,
    addressProps,

    participantsCount,
    participantType,
    inContext,
    sex,

    valuesInstanceLimit,
  });
  tournamentEngine.addParticipants({ participants });

  const drawIds = [],
    eventIds = [];
  if (drawProfiles) {
    drawProfiles.forEach((drawProfile) => {
      const { drawId, eventId } = generateEventWithDraw({
        drawProfile,
        participants,
        tournamentEngine,
        completeAllMatchUps,
        randomWinningSide,
        goesTo,
      });
      drawIds.push(drawId);
      eventIds.push(eventId);
    });
  }

  const { tournamentRecord } = tournamentEngine.getState();
  return { tournamentRecord, drawIds, eventIds };
}

function generateEventWithDraw({
  drawProfile,
  participants,
  tournamentEngine,
  completeAllMatchUps,
  randomWinningSide,
  goesTo,
}) {
  const {
    category,
    eventName = 'Generated Event',
    eventType = SINGLES,
    matchUpFormat = FORMAT_STANDARD,
    drawSize = 32,
    drawType = SINGLE_ELIMINATION,
    feedPolicy,
    structureOptions,
    automated,
  } = drawProfile;
  let { participantsCount = 32, seedsCount } = drawProfile;
  if (participantsCount > drawSize) participantsCount = drawSize;

  const event = { eventName, eventType, category };
  let result = tournamentEngine.addEvent({ event });
  if (result.error) return { error: result.error };

  const { event: createdEvent } = result;
  const { eventId } = createdEvent;

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
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  if (result.error) return { error: result.error };

  const alternatesParticipantIds = participants
    .filter(isEventParticipantType)
    .slice(participantsCount)
    .map((p) => p.participantId);
  if (alternatesParticipantIds.length) {
    result = tournamentEngine.addEventEntries({
      eventId,
      entryStatus: ALTERNATE,
      participantIds: alternatesParticipantIds,
    });
    if (result.error) return { error: result.error };
  }

  const {
    drawDefinition,
    error: generationError,
  } = tournamentEngine.generateDrawDefinition({
    eventId,
    drawSize,
    matchUpFormat,
    drawType,
    seedsCount,
    feedPolicy,
    structureOptions,
    goesTo,
    automated,
  });

  if (generationError) return { error: generationError };
  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });

  const { drawId } = drawDefinition;

  const manual = automated === false;
  if (!manual && completeAllMatchUps) {
    completeDrawMatchUps({
      tournamentEngine,
      drawId,
      matchUpFormat,
      randomWinningSide,
    });
  } else if (!manual && drawProfile.outcomes) {
    const { matchUps } = tournamentEngine.allDrawMatchUps({
      drawId,
      inContext: true,
    });
    drawProfile.outcomes.forEach((outcomeDef) => {
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
      completeMatchUp({
        tournamentEngine,
        targetMatchUp,
        scoreString,
        winningSide,
        matchUpStatus,
        outcomeDef,
        matchUpFormat,
        drawId,
      });
    });
  }

  if (result.error) return { error: result.error };

  return { drawId, eventId };
}

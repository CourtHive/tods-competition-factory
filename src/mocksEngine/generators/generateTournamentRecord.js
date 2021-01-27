import { generateOutcomeFromScoreString } from './generateOutcomeFromScoreString';
import { generateParticipants } from './generateParticipants';
import { tournamentEngine } from '../../tournamentEngine';
import { intersection } from '../../utilities';

import { INDIVIDUAL, PAIR, TEAM } from '../../constants/participantTypes';
import {
  MAIN,
  SINGLE_ELIMINATION,
} from '../../constants/drawDefinitionConstants';
import { SINGLES, DOUBLES } from '../../constants/eventConstants';
import { ALTERNATE } from '../../constants/entryStatusConstants';
import { BYE, COMPLETED } from '../../constants/matchUpStatusConstants';
import { FORMAT_STANDARD } from '../../fixtures/scoring/matchUpFormats/formatConstants';

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

  inContext,
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
  } = drawProfile;
  let { participantsCount = 32 } = drawProfile;
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
    feedPolicy,
    structureOptions,
  });

  if (generationError) return { error: generationError };
  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });

  const { drawId } = drawDefinition;

  if (drawProfile.outcomes) {
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
      const { matchUpId } = targetMatchUp || {};
      const { outcome } = generateOutcomeFromScoreString({
        scoreString,
        winningSide,
        matchUpStatus,
      });
      if (!targetMatchUp) {
        console.log({ outcomeDef });
        return;
      }
      if (targetMatchUp.matchUpStatus === BYE) {
        console.log('targeted BYE matchUp', { outcomeDef });
        return;
      }
      const result = tournamentEngine.setMatchUpStatus({
        drawId,
        matchUpId,
        outcome,
        matchUpFormat,
      });
      if (!result.success) console.log(result, targetMatchUp);
    });
  }

  if (result.error) return { error: result.error };

  return { drawId, eventId };
}

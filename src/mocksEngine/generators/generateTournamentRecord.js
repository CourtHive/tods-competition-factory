import { generateScoreString } from '../../drawEngine/governors/scoreGovernor/generateScoreString';
import { getRoundMatchUps } from '../../drawEngine/getters/getMatchUps';
import { parseScoreString } from '../utilities/parseScoreString';
import { generateParticipants } from './generateParticipants';
import { tournamentEngine } from '../../tournamentEngine';

import { INDIVIDUAL, PAIR, TEAM } from '../../constants/participantTypes';
import {
  MAIN,
  SINGLE_ELIMINATION,
} from '../../constants/drawDefinitionConstants';
import { SINGLES, DOUBLES } from '../../constants/eventConstants';
import { ALTERNATE } from '../../constants/entryStatusConstants';
import { COMPLETED } from '../../constants/matchUpStatusConstants';

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
    // drawProfiles?.map((drawProfile) => drawProfile.drawSize) || 32;
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
    matchUpFormat = 'SET3-S:6/TB7',
    drawSize = 32,
    drawType = SINGLE_ELIMINATION,
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
  });

  if (generationError) return { error: generationError };
  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });

  const { drawId } = drawDefinition;

  if (drawProfile.outcomes) {
    const { matchUps } = tournamentEngine.allDrawMatchUps({
      drawId,
      inContext: true,
    });
    const { roundMatchUps } = getRoundMatchUps({
      matchUps,
    });
    drawProfile.outcomes.forEach((outcome) => {
      const {
        roundNumber,
        roundPosition,
        scoreString,
        winningSide,
        matchUpStatus = COMPLETED,
        stage = MAIN,
        stageSequence = 1,
      } = outcome;
      const targetMatchUp = roundMatchUps[roundNumber].find(
        (matchUp) =>
          matchUp.stage === stage &&
          matchUp.stageSequence === stageSequence &&
          matchUp.roundPosition === roundPosition
      );
      const { matchUpId } = targetMatchUp;
      const sets = scoreString && parseScoreString({ scoreString });
      const score = { sets };
      const winningScoreString = generateScoreString({ sets, winningSide });
      const losingScoreString = generateScoreString({
        sets,
        winningSide,
        reversed: true,
      });
      if (winningSide === 1) {
        score.scoreStringSide1 = winningScoreString;
        score.scoreStringSide2 = losingScoreString;
      } else if (winningSide === 2) {
        score.scoreStringSide1 = losingScoreString;
        score.scoreStringSide2 = winningScoreString;
      } else {
        score.scoreStringSide1 = scoreString;
      }
      const result = tournamentEngine.setMatchUpStatus({
        drawId,
        matchUpId,
        matchUpStatus,
        outcome: {
          winningSide,
          score,
        },
      });
      if (!result.success) console.log(result);
    });
  }

  if (result.error) return { error: result.error };

  return { drawId, eventId };
}

import { generateParticipants } from './generateParticipants';
import { tournamentEngine } from '../../tournamentEngine';

import { INDIVIDUAL, PAIR, TEAM } from '../../constants/participantTypes';
import { SINGLE_ELIMINATION } from '../../constants/drawDefinitionConstants';
import { SINGLES, DOUBLES } from '../../constants/eventConstants';
import { ALTERNATE } from '../../constants/entryStatusConstants';
import drawEngine from '../../drawEngine';

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
    drawProfiles?.map((drawProfile) => drawProfile.drawSize) || 32;
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
    eventName = 'Generated Event',
    eventType = SINGLES,
    matchUpFormat = 'SET3-S:6/TB7',
    drawSize = 32,
    drawType = SINGLE_ELIMINATION,
  } = drawProfile;
  let { participantsCount = 32 } = drawProfile;
  if (participantsCount > drawSize) participantsCount = drawSize;

  const event = { eventName, eventType };
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
    const { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });
    const { roundMatchUps } = drawEngine.getRoundMatchUps({
      matchUps,
    });
    drawProfile.outcomes.forEach((outcome) => {
      const [roundNumber, roundPosition, scoreString] = outcome;
      const matchUp = roundMatchUps[roundNumber].find(
        (matchUp) => matchUp.roundPosition === roundPosition
      );
      console.log({ matchUp });
    });
  }

  if (result.error) return { error: result.error };

  return { drawId, eventId };
}

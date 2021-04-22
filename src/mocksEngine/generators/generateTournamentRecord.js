import { generateEventWithFlights } from './generateEventWithFlights';
import { generateEventWithDraw } from './generateEventWithDraw';
import { tournamentEngine } from '../../tournamentEngine/sync';
import { generateParticipants } from './generateParticipants';

import { INDIVIDUAL, PAIR } from '../../constants/participantTypes';
import { DOUBLES } from '../../constants/eventConstants';

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
  eventProfiles,

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

  const getEventProfileParticipantsCount = (eventProfile) =>
    eventProfile?.drawProfiles.reduce((total, { drawSize, drawEntries }) => {
      const size = Math.max(drawSize || 0, drawEntries?.length || 0);
      return total + size;
    }, 0) || 0;

  const largestDrawSize =
    Math.max(
      ...(drawProfiles || []).map((drawProfile) => drawProfile.drawSize),
      ...(eventProfiles || []).map(getEventProfileParticipantsCount)
    ) || 32;

  const doublesEvents = drawProfiles?.find(
    (drawProfile) => drawProfile.eventType === DOUBLES
  );
  const doublesFactor = doublesEvents ? 2 : 1;
  const minPartcipantsCount = largestDrawSize * doublesFactor;

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
        completeAllMatchUps,
        randomWinningSide,
        goesTo,
      });
      drawIds.push(drawId);
      eventIds.push(eventId);
    });
  }

  if (eventProfiles) {
    eventProfiles.forEach((eventProfile) => {
      const { eventId, drawIds } = generateEventWithFlights({
        eventProfile,
        participants,
        completeAllMatchUps,
        randomWinningSide,
      });
      drawIds.push(...drawIds);
      eventIds.push(eventId);
    });
  }

  const { tournamentRecord } = tournamentEngine.getState();
  return { tournamentRecord, drawIds, eventIds };
}

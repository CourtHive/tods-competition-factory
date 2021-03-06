import { generateEventWithFlights } from './generateEventWithFlights';
import { generateEventWithDraw } from './generateEventWithDraw';
import { generateParticipants } from './generateParticipants';
import tournamentEngine from '../../tournamentEngine/sync';
import {
  dateRange,
  formatDate,
  isValidDateString,
} from '../../utilities/dateTime';

import { INVALID_DATE } from '../../constants/errorConditionConstants';
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
 * @param {object[]} venueProfiles - [{ courtsCount, venueName, dateAvailability, startTime, endTime }]
 * @param {object[]} outcomes - [{ roundNumber, roundPosition, scoreString, winningSide, ... }]
 * @param {boolean} completeAllMatchUps
 * @param {boolean} randomWinningSide
 * @param {boolean} inContext
 *
 */
export function generateTournamentRecord({
  endDate,
  startDate,
  tournamentName,

  participantsProfile,
  drawProfiles,
  eventProfiles,
  venueProfiles,

  completeAllMatchUps,
  randomWinningSide,
  // inContext,
  goesTo,
} = {}) {
  let { participantsCount = 32, participantType = INDIVIDUAL } =
    participantsProfile || {};

  if (
    (startDate && !isValidDateString(startDate)) ||
    (endDate && !isValidDateString(endDate))
  )
    return { error: INVALID_DATE };

  if (!startDate) {
    const tournamentDate = new Date();
    startDate = formatDate(tournamentDate);
    endDate = formatDate(tournamentDate.setDate(tournamentDate.getDate() + 7));
  }
  if (!endDate) {
    const tournamentDate = new Date(startDate);
    endDate = formatDate(tournamentDate.setDate(tournamentDate.getDate() + 7));
  }

  const result = tournamentEngine.newTournamentRecord({
    startDate,
    endDate,
    tournamentName,
  });
  if (result.error) return result;

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

  const {
    addressProps,
    nationalityCodes,
    nationalityCodesCount,
    valuesInstanceLimit,
    inContext,

    sex,
  } = participantsProfile || {};

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
    eventIds = [],
    venueIds = [];
  if (drawProfiles) {
    for (const drawProfile of drawProfiles) {
      const { drawId, eventId } = generateEventWithDraw({
        completeAllMatchUps,
        randomWinningSide,
        participants,
        drawProfile,
        startDate,
        goesTo,
      });
      drawIds.push(drawId);
      eventIds.push(eventId);
    }
  }

  if (eventProfiles) {
    for (const eventProfile of eventProfiles) {
      const { eventId, drawIds: generatedDrawIds } = generateEventWithFlights({
        completeAllMatchUps,
        randomWinningSide,
        eventProfile,
        participants,
      });
      if (generatedDrawIds) drawIds.push(...generatedDrawIds);
      eventIds.push(eventId);
    }
  }

  if (venueProfiles) {
    for (const [index, venueProfile] of venueProfiles.entries()) {
      let {
        venueName,
        courtsCount,
        dateAvailability,
        startTime = '07:00',
        endTime = '19:00',
      } = venueProfile;
      const venue = { venueName: venueName || `Venue ${index + 1}` };
      const {
        venue: { venueId },
      } = tournamentEngine.devContext({ addVenue: true }).addVenue({ venue });
      venueIds.push(venueId);

      const dates = dateRange(startDate, endDate);
      dateAvailability =
        (!Array.isArray(dateAvailability) &&
          dates.map((date) => ({
            date: formatDate(date),
            startTime,
            endTime,
          }))) ||
        dateAvailability;

      tournamentEngine.addCourts({
        venueId,
        courtsCount,
        dateAvailability,
      });
    }
  }

  const { tournamentRecord } = tournamentEngine.getState();
  tournamentEngine.reset();

  return { tournamentRecord, drawIds, eventIds, venueIds };
}

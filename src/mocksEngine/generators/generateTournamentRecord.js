import { generateEventWithFlights } from './generateEventWithFlights';
import { dateRange, formatDate } from '../../utilities/dateTime';
import { generateEventWithDraw } from './generateEventWithDraw';
import { tournamentEngine } from '../../tournamentEngine/sync';
import { generateParticipants } from './generateParticipants';

import { INDIVIDUAL, PAIR } from '../../constants/participantTypes';
import { DOUBLES } from '../../constants/eventConstants';
import competitionEngine from '../../competitionEngine/sync';

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
  venueProfiles,

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

  if (!startDate && !endDate) {
    const tournamentDate = new Date();
    startDate = formatDate(tournamentDate);
    endDate = formatDate(tournamentDate.setDate(tournamentDate.getDate() + 7));
  }

  const result = tournamentEngine.newTournamentRecord({ startDate, endDate });
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

  if (venueProfiles) {
    venueProfiles.forEach(
      ({ venueName, courtsCount, dateAvailability }, index) => {
        const venue = { venueName: venueName || `Venue ${index + 1}` };
        const {
          venue: { venueId },
        } = tournamentEngine.devContext(true).addVenue({ venue });
        venueIds.push(venueId);

        const dates = dateRange(startDate, endDate);
        dateAvailability =
          (!Array.isArray(dateAvailability) &&
            dates.map((date) => ({
              date: formatDate(date),
              startTime: '07:00',
              endTime: '19:00',
            }))) ||
          dateAvailability;

        tournamentEngine.addCourts({
          venueId,
          courtsCount,
          dateAvailability,
        });
      }
    );
  }

  const { tournamentRecord } = tournamentEngine.getState();
  competitionEngine.setTournamentRecord(tournamentRecord);

  return { tournamentRecord, drawIds, eventIds, venueIds };
}

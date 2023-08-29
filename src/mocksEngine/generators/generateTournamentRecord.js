import { scheduleProfileRounds } from '../../competitionEngine/governors/scheduleGovernor/schedulingProfile/scheduleProfileRounds';
import { attachPolicies } from '../../tournamentEngine/governors/policyGovernor/policyManagement';
import { newTournamentRecord } from '../../tournamentEngine/generators/newTournamentRecord';
import { addEvent } from '../../tournamentEngine/governors/eventGovernor/addEvent';
import { isValidExtension } from '../../global/validation/isValidExtension';
import { formatDate, isValidDateString } from '../../utilities/dateTime';
import { addTournamentParticipants } from './addTournamentParticipants';
import { generateScheduledRounds } from './generateScheduledRounds';
import { generateEventWithFlights } from './generateEventWithFlights';
import { cycleMutationStatus } from '../../global/state/globalState';
import { generateEventWithDraw } from './generateEventWithDraw';
import { definedAttributes } from '../../utilities/objects';
import { generateVenues } from './generateVenues';

import defaultRatingsParameters from '../../fixtures/ratings/ratingsParameters';
import { SUCCESS } from '../../constants/resultConstants';
import {
  INVALID_DATE,
  INVALID_VALUES,
} from '../../constants/errorConditionConstants';

/**
 *
 * Generate a complete tournamentRecord from the following attributes
 *
 * @param {object} tournamentAttributes - Object attributes will be applied to generated tournamentRecord
 * @param {object[]} tournamentExtensions - Array of extensions to be attached to tournamentRecord
 * @param {object[]} drawProfiles - optional - [{ category, drawSize, drawType, eventType, matchUpFormat, tieFormat, tieFormatName }]
 * @param {object[]} eventProfiles - optional - [{ category, eventType, matchUpFormat, tieFormat, tieFormatName }]
 * @param {object[]} venueProfiles - optional - [{ courtsCount, venueName, dateAvailability, startTime, endTime }]
 * @param {string[]} uuids - array of unique identifiers to be used in entity generators
 * @param {string} startDate - optional - ISO string date
 * @param {string} endDate - optional - ISO string date
 * @param {object} participantsProfile - optional - { participantsCount, participantType }
 * @param {object} policyDefinitions - optional - { [policyType]: policyDefinitions, [policyType2]: policyDefinitions }
 * @param {object} matchUpStatusProfile - optional - whole number percent for each target matchUpStatus { [matchUpStatus]: percentLikelihood }
 * @param {object} schedulingProfile
 * @param {boolean} autoEntryPositions - true by default; if false, { entryPosition } will not be present on entries array
 * @param {boolean} completeAllMatchUps - optional - boolean (legacy support for scoreString to apply to all matchUps)
 * @param {boolean} randomWinningSide
 * @param {boolean} autoSchedule
 *
 */
export function generateTournamentRecord({
  scheduleCompletedMatchUps, // explicit override for scheduler
  ratingsParameters = defaultRatingsParameters,
  tournamentName = 'Mock Tournament',
  tournamentExtensions,
  tournamentAttributes,
  matchUpStatusProfile,
  participantsProfile,
  completeAllMatchUps,
  autoEntryPositions,
  hydrateCollections,
  randomWinningSide,
  policyDefinitions,
  schedulingProfile,
  eventProfiles,
  venueProfiles,
  drawProfiles,
  autoSchedule,
  startDate,
  endDate,
  uuids,
} = {}) {
  if (
    (startDate && !isValidDateString(startDate)) ||
    (endDate && !isValidDateString(endDate))
  )
    return { error: INVALID_DATE };

  if (eventProfiles && !Array.isArray(eventProfiles))
    return { error: INVALID_VALUES };

  if (!startDate) {
    const tournamentDate = new Date();
    startDate = formatDate(endDate || tournamentDate);
    endDate = formatDate(tournamentDate.setDate(tournamentDate.getDate() + 7));
  }
  if (!endDate) {
    const tournamentDate = new Date(startDate);
    endDate = formatDate(tournamentDate.setDate(tournamentDate.getDate() + 7));
  }

  if (typeof tournamentAttributes !== 'object') tournamentAttributes = {};
  const tournamentRecord = newTournamentRecord({
    ...tournamentAttributes,
    tournamentName,
    startDate,
    endDate,
  });

  // attach any valid tournamentExtensions
  if (tournamentExtensions?.length && Array.isArray(tournamentExtensions)) {
    const extensions = tournamentExtensions.filter(isValidExtension);

    if (extensions?.length)
      Object.assign(tournamentRecord, { extensions, isMock: true });
  }

  if (typeof policyDefinitions === 'object') {
    for (const policyType of Object.keys(policyDefinitions)) {
      attachPolicies({
        policyDefinitions: { [policyType]: policyDefinitions[policyType] },
        tournamentRecord,
      });
    }
  }

  const result = addTournamentParticipants({
    participantsProfile,
    tournamentRecord,
    eventProfiles,
    drawProfiles,
    startDate,
    uuids,
  });
  if (!result.success) return result;

  const drawIds = [],
    eventIds = [],
    allUniqueParticipantIds = [];

  if (Array.isArray(drawProfiles)) {
    let drawIndex = 0;
    for (const drawProfile of drawProfiles) {
      let result = generateEventWithDraw({
        allUniqueParticipantIds,
        matchUpStatusProfile,
        participantsProfile,
        completeAllMatchUps,
        autoEntryPositions,
        hydrateCollections,
        randomWinningSide,
        ratingsParameters,
        tournamentRecord,
        isMock: true,
        drawProfile,
        startDate,
        drawIndex,
        uuids,
      });
      if (result.error) return result;

      const { drawId, eventId, event, uniqueParticipantIds } = result;

      result = addEvent({
        suppressNotifications: false,
        internalUse: true,
        tournamentRecord,
        event,
      });
      if (result.error) return result;

      if (drawId) drawIds.push(drawId);
      eventIds.push(eventId);

      if (uniqueParticipantIds?.length)
        allUniqueParticipantIds.push(...uniqueParticipantIds);

      drawIndex += 1;
    }
  }

  if (eventProfiles) {
    let eventIndex = 0;
    for (const eventProfile of eventProfiles) {
      const result = generateEventWithFlights({
        allUniqueParticipantIds,
        matchUpStatusProfile,
        participantsProfile,
        completeAllMatchUps,
        autoEntryPositions,
        hydrateCollections,
        randomWinningSide,
        ratingsParameters,
        tournamentRecord,
        eventProfile,
        eventIndex,
        startDate,
        uuids,
      });
      if (result.error) return result;

      const {
        eventId,
        drawIds: generatedDrawIds,
        uniqueParticipantIds,
      } = result;

      if (generatedDrawIds) drawIds.push(...generatedDrawIds);
      eventIds.push(eventId);

      if (uniqueParticipantIds?.length)
        allUniqueParticipantIds.push(...uniqueParticipantIds);

      eventIndex += 1;
    }
  }

  const venueIds = venueProfiles?.length
    ? generateVenues({ tournamentRecord, venueProfiles, uuids })
    : [];

  let scheduledRounds;
  let schedulerResult = {};
  if (schedulingProfile) {
    const result = generateScheduledRounds({
      schedulingProfile,
      tournamentRecord,
    });
    if (result.error) return result;
    scheduledRounds = result.scheduledRounds;

    if (autoSchedule) {
      const { tournamentId } = tournamentRecord;
      const tournamentRecords = { [tournamentId]: tournamentRecord };

      schedulerResult = scheduleProfileRounds({
        scheduleCompletedMatchUps,
        tournamentRecords,
      });
    }
  }

  // clear globalState modified flag;
  cycleMutationStatus();

  return definedAttributes({
    ...SUCCESS,
    tournamentRecord,
    scheduledRounds,
    schedulerResult,
    eventIds,
    venueIds,
    drawIds,
  });
}

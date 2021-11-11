import { scheduleProfileRounds } from '../../competitionEngine/governors/scheduleGovernor/schedulingProfile/scheduleProfileRounds';
import { generateTeamsFromParticipantAttribute } from '../../tournamentEngine/generators/teamsGenerator';
import { addParticipants } from '../../tournamentEngine/governors/participantGovernor/addParticipants';
import { attachPolicies } from '../../tournamentEngine/governors/policyGovernor/policyManagement';
import { newTournamentRecord } from '../../tournamentEngine/generators/newTournamentRecord';
import { addEvent } from '../../tournamentEngine/governors/eventGovernor/addEvent';
import { formatDate, isValidDateString } from '../../utilities/dateTime';
import { isValidExtension } from '../../global/validation/isValidExtension';
import { generateSchedulingProfile } from './generateSchedulingProfile';
import { generateEventWithFlights } from './generateEventWithFlights';
import { getParticipantId } from '../../global/functions/extractors';
import { generateEventWithDraw } from './generateEventWithDraw';
import { generateParticipants } from './generateParticipants';
import { getParticipantsCount } from './getParticipantsCount';
import { definedAttributes } from '../../utilities/objects';
import { generateRange, UUID } from '../../utilities';
import { generateVenues } from './generateVenues';

import defaultRatingsParameters from '../../fixtures/ratings/ratingsParameters';
import { INVALID_DATE } from '../../constants/errorConditionConstants';
import { INDIVIDUAL } from '../../constants/participantTypes';
import { COMPETITOR } from '../../constants/participantRoles';
import { TEAM } from '../../constants/eventConstants';

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
 * @param {boolean} inContext
 *
 */
export function generateTournamentRecord({
  ratingsParameters = defaultRatingsParameters,
  tournamentName = 'Mock Tournament',
  tournamentExtensions,
  tournamentAttributes,
  matchUpStatusProfile,
  participantsProfile,
  completeAllMatchUps,
  autoEntryPositions,
  randomWinningSide,
  policyDefinitions,
  schedulingProfile,
  eventProfiles,
  venueProfiles,
  drawProfiles,
  autoSchedule,
  startDate,
  endDate,
  goesTo,
  uuids,
} = {}) {
  if (
    (startDate && !isValidDateString(startDate)) ||
    (endDate && !isValidDateString(endDate))
  )
    return { error: INVALID_DATE };

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

  const {
    participantsCount,
    participantType,
    largestTeamDraw,
    largestTeamSize,
  } = getParticipantsCount({
    participantsProfile,
    eventProfiles,
    drawProfiles,
  });

  const {
    nationalityCodesCount,
    nationalityCodeType,
    valuesInstanceLimit,
    nationalityCodes,
    personExtensions,
    addressProps,
    personData,
    personIds,
    inContext,
    teamKey,
    sex,
  } = participantsProfile || {};

  const { participants } = generateParticipants({
    consideredDate: startDate,
    valuesInstanceLimit,

    nationalityCodesCount,
    nationalityCodeType,
    nationalityCodes,

    personExtensions,
    addressProps,
    personData,
    sex,

    participantsCount,
    participantType,
    personIds,
    uuids,

    inContext,
  });

  let result = addParticipants({ tournamentRecord, participants });
  if (!result.success) return result;

  if (teamKey) {
    const result = generateTeamsFromParticipantAttribute({
      tournamentRecord,
      ...teamKey,
    });
    if (result.error) return result;
  }

  // generate Team participants
  const allIndividualParticipantIds = participants
    .filter(({ participantType }) => participantType === INDIVIDUAL)
    .map(getParticipantId);
  const teamParticipants = generateRange(0, largestTeamDraw).map(
    (teamIndex) => {
      const individualParticipantIds = allIndividualParticipantIds.slice(
        teamIndex * largestTeamSize,
        (teamIndex + 1) * largestTeamSize
      );
      return {
        participantName: `Team ${teamIndex + 1}`,
        participantRole: COMPETITOR,
        participantType: TEAM,
        participantId: UUID(),
        individualParticipantIds,
      };
    }
  );
  result = addParticipants({
    tournamentRecord,
    participants: teamParticipants,
  });
  if (!result.success) return result;

  const drawIds = [],
    eventIds = [],
    allUniqueParticipantIds = [];

  if (drawProfiles) {
    for (const drawProfile of drawProfiles) {
      const { drawId, eventId, event, error, uniqueParticipantIds } =
        generateEventWithDraw({
          allUniqueParticipantIds,
          matchUpStatusProfile,
          participantsProfile,
          completeAllMatchUps,
          autoEntryPositions,
          randomWinningSide,
          ratingsParameters,
          tournamentRecord,
          drawProfile,
          startDate,
          goesTo,
          uuids,
        });
      if (error) return { error };

      const result = addEvent({ tournamentRecord, event });
      if (result.error) return result;

      if (drawId) drawIds.push(drawId);
      eventIds.push(eventId);

      if (uniqueParticipantIds?.length)
        allUniqueParticipantIds.push(...uniqueParticipantIds);
    }
  }

  if (eventProfiles) {
    for (const eventProfile of eventProfiles) {
      const {
        error,
        eventId,
        drawIds: generatedDrawIds,
        uniqueParticipantIds,
      } = generateEventWithFlights({
        allUniqueParticipantIds,
        matchUpStatusProfile,
        participantsProfile,
        completeAllMatchUps,
        autoEntryPositions,
        randomWinningSide,
        ratingsParameters,
        tournamentRecord,
        eventProfile,
        startDate,
        uuids,
      });
      if (error) return { error };

      if (generatedDrawIds) drawIds.push(...generatedDrawIds);
      eventIds.push(eventId);

      if (uniqueParticipantIds?.length)
        allUniqueParticipantIds.push(...uniqueParticipantIds);
    }
  }

  const venueIds = venueProfiles?.length
    ? generateVenues({ tournamentRecord, venueProfiles })
    : [];

  let scheduledRounds;
  let schedulerResult = {};
  if (schedulingProfile) {
    const result = generateSchedulingProfile({
      schedulingProfile,
      tournamentRecord,
    });
    if (result.error) return result;
    scheduledRounds = result.scheduledRounds;

    if (autoSchedule) {
      const { tournamentId } = tournamentRecord;
      const tournamentRecords = { [tournamentId]: tournamentRecord };

      schedulerResult = scheduleProfileRounds({ tournamentRecords });
    }
  }

  return definedAttributes({
    tournamentRecord,
    scheduledRounds,
    schedulerResult,
    eventIds,
    venueIds,
    drawIds,
  });
}

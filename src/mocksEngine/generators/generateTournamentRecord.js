import { scheduleProfileRounds } from '../../competitionEngine/governors/scheduleGovernor/schedulingProfile/scheduleProfileRounds';
import { generateTeamsFromParticipantAttribute } from '../../tournamentEngine/generators/teamsGenerator';
import { addParticipants } from '../../tournamentEngine/governors/participantGovernor/addParticipants';
import { attachPolicies } from '../../tournamentEngine/governors/policyGovernor/policyManagement';
import { newTournamentRecord } from '../../tournamentEngine/generators/newTournamentRecord';
import tieFormatDefaults from '../../tournamentEngine/generators/tieFormatDefaults';
import { addEvent } from '../../tournamentEngine/governors/eventGovernor/addEvent';
import { formatDate, isValidDateString } from '../../utilities/dateTime';
import { validExtension } from '../../global/validation/validExtension';
import { generateSchedulingProfile } from './generateSchedulingProfile';
import { generateEventWithFlights } from './generateEventWithFlights';
import { getParticipantId } from '../../global/functions/extractors';
import { generateEventWithDraw } from './generateEventWithDraw';
import { generateParticipants } from './generateParticipants';
import { definedAttributes } from '../../utilities/objects';
import { generateRange, UUID } from '../../utilities';
import { processTieFormat } from './processTieFormat';
import { generateVenues } from './generateVenues';

import { INVALID_DATE } from '../../constants/errorConditionConstants';
import { INDIVIDUAL, PAIR } from '../../constants/participantTypes';
import { DOUBLES, TEAM } from '../../constants/eventConstants';
import { COMPETITOR } from '../../constants/participantRoles';

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
  let { participantsCount, participantType = INDIVIDUAL } =
    participantsProfile || {};
  const specifiedParicipantsCount = participantsCount || 0; // capture this to ensure calculated participantsCount is not below

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
    const extensions = tournamentExtensions.filter(validExtension);

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

  let largestDoublesDraw = 0,
    largestSinglesDraw = 0,
    largestTeamSize = 0,
    largestTeamDraw = 0;

  const processDrawProfile = ({
    alternatesCount = 0,
    uniqueParticipants,
    tieFormatName,
    drawSize = 0,
    eventType,
    tieFormat,
    category,
    gender,
  }) => {
    const isDoubles = eventType === DOUBLES;
    const isTeam = eventType === TEAM;
    if (isTeam && !category && !uniqueParticipants && !gender) {
      largestTeamDraw = Math.max(largestTeamDraw, drawSize + alternatesCount);

      tieFormat =
        typeof tieFormat === 'object'
          ? tieFormat
          : tieFormatDefaults({ namedFormat: tieFormatName });

      const { teamSize, maxDoublesDraw, maxSinglesDraw } = processTieFormat({
        alternatesCount,
        tieFormatName,
        tieFormat,
        drawSize,
      });
      largestTeamSize = Math.max(largestTeamSize, teamSize);
      largestDoublesDraw = Math.max(largestDoublesDraw, maxDoublesDraw);
      largestSinglesDraw = Math.max(largestSinglesDraw, maxSinglesDraw);
    }
    if (
      isDoubles &&
      drawSize + alternatesCount &&
      drawSize + alternatesCount > largestDoublesDraw
    )
      largestDoublesDraw = drawSize + alternatesCount;
    if (!isDoubles && !isTeam && drawSize && drawSize > largestSinglesDraw)
      largestSinglesDraw = drawSize + alternatesCount;
  };

  let categories = []; // use when generating participants

  eventProfiles?.forEach((eventProfile) => {
    const {
      tieFormatName: eventTieFormatName,
      tieFormat: eventTieFormat,
      drawProfiles,
      eventType,
      category,
    } = eventProfile;

    if (drawProfiles) {
      for (const drawProfile of drawProfiles) {
        const { tieFormatName, tieFormat } = drawProfile;

        processDrawProfile({
          ...drawProfile,
          tieFormatName: tieFormatName || eventTieFormatName,
          tieFormat: tieFormat || eventTieFormat,
          eventType,
        });
      }
    } else {
      if (category) categories.push(category);
    }
  });

  if (drawProfiles) {
    for (const drawProfile of drawProfiles) {
      processDrawProfile(drawProfile);
    }
  }
  const individualCompetitorsCount = Math.max(
    largestTeamDraw * largestTeamSize,
    largestDoublesDraw * 2,
    largestSinglesDraw
  );

  if (largestDoublesDraw) participantType = PAIR;
  if (
    (participantsCount || specifiedParicipantsCount) <
    individualCompetitorsCount
  )
    participantsCount = individualCompetitorsCount;

  if (
    participantsCount &&
    largestDoublesDraw &&
    [PAIR, TEAM].includes(participantType)
  ) {
    // if we are generating PAIRs or TEAMs...
    if (
      largestSinglesDraw &&
      Math.floor(largestSinglesDraw / 2) > largestDoublesDraw
    ) {
      // if the half the singles draw is still larger than doubles draw
      participantsCount = Math.floor(largestSinglesDraw / 2);
    } else if (
      !largestSinglesDraw ||
      largestDoublesDraw * 2 >= largestSinglesDraw
    ) {
      // otherwise participantsCount can be cut in half
      participantsCount = Math.ceil(participantsCount / 2);
    }
  }

  if (!participantsCount) participantsCount = 32;
  if (participantsCount < specifiedParicipantsCount)
    participantsCount = specifiedParicipantsCount;

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
          tournamentRecord,
          allUniqueParticipantIds,
          autoEntryPositions,
          participantsProfile,
          completeAllMatchUps,
          matchUpStatusProfile,
          randomWinningSide,
          drawProfile,
          startDate,
          goesTo,
        });
      if (error) return { error };

      const result = addEvent({ tournamentRecord, event });
      if (result.error) return result;

      drawIds.push(drawId);
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
        tournamentRecord,
        eventProfile,
        startDate,
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

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
import { generateVenues } from './generateVenues';

import { INVALID_DATE } from '../../constants/errorConditionConstants';
import { INDIVIDUAL, PAIR } from '../../constants/participantTypes';
import { DOUBLES, TEAM } from '../../constants/eventConstants';
import { SINGLES } from '../../constants/matchUpTypes';
import { COMPETITOR } from '../../constants/participantRoles';

/**
 *
 * Generate a complete tournamentRecord from the following attributes
 *
 * @param {string} startDate - optional - ISO string date
 * @param {string} endDate - optional - ISO string date
 * @param {object} participantsProfile - optional - { participantsCount, participantType }
 * @param {object} policyDefinitions - optional - { [policyType]: policyDefinitions, [policyType2]: policyDefinitions }
 * @param {object[]} drawProfiles - optional - [{ category, drawSize, drawType, eventType, matchUpFormat }]
 * @param {object[]} venueProfiles - optional - [{ courtsCount, venueName, dateAvailability, startTime, endTime }]
 * @param {boolean} completeAllMatchUps - optional - boolean (legacy support for scoreString to apply to all matchUps)
 * @param {object} matchUpStatusProfile - optional - whole number percent for each target matchUpStatus { [matchUpStatus]: percentLikelihood }
 * @param {boolean} randomWinningSide
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
    startDate,
    endDate,
    tournamentName,
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
        tournamentRecord,
        policyDefinitions: { [policyType]: policyDefinitions[policyType] },
      });
    }
  }

  let largestDoublesDraw = 0,
    largestSinglesDraw = 0,
    largestTeamSize = 0,
    largestTeamDraw = 0;

  const processDrawProfile = ({
    drawSize = 0,
    alternatesCount = 0,
    eventType,
    tieFormat,
  }) => {
    const isDoubles = eventType === DOUBLES;
    const isTeam = eventType === TEAM;
    if (isTeam) {
      let teamDoublesCount = 0,
        teamSinglesCount = 0;
      largestTeamDraw = Math.max(largestTeamDraw, drawSize + alternatesCount);
      typeof tieFormat === 'object'
        ? tieFormat
        : tieFormatDefaults({ namedFormat: tieFormat });
      tieFormat?.collectionDefinitions?.forEach((collectionDefinition) => {
        // ensure every collectionDefinition has a collectionId
        if (!collectionDefinition.collectionId)
          collectionDefinition.collectionId = UUID();

        if (collectionDefinition?.matchUpType === DOUBLES) {
          const doublesCount = collectionDefinition.matchUpCount;
          teamDoublesCount = Math.max(teamDoublesCount, doublesCount);
          if (collectionDefinition.matchUpCount > largestDoublesDraw)
            largestDoublesDraw =
              doublesCount * (drawSize + alternatesCount || 1);
        }

        if (collectionDefinition?.matchUpType === SINGLES) {
          const singlescount = collectionDefinition.matchUpCount;
          teamSinglesCount = Math.max(teamSinglesCount, singlescount);
          if (collectionDefinition.matchUpCount > largestSinglesDraw)
            largestSinglesDraw =
              singlescount * (drawSize + alternatesCount || 1);
        }
      });
      const teamSize = Math.max(teamSinglesCount, teamDoublesCount * 2);
      largestTeamSize = Math.max(largestTeamSize, teamSize);
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

  eventProfiles?.forEach(({ eventType, drawProfiles }) => {
    if (drawProfiles) {
      for (const drawProfile of drawProfiles) {
        const { drawSize, alternatesCount, tieFormat } = drawProfile;
        processDrawProfile({ drawSize, alternatesCount, eventType, tieFormat });
      }
    }
  });

  if (drawProfiles) {
    for (const drawProfile of drawProfiles) {
      const { drawSize, alternatesCount, eventType, tieFormat } = drawProfile;
      processDrawProfile({ drawSize, alternatesCount, eventType, tieFormat });
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
    teamKey,
    addressProps,
    personData,
    personIds,
    inContext,
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

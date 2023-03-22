import tieFormatDefaults from '../../tournamentEngine/generators/tieFormatDefaults';
import { processTieFormat } from './processTieFormat';

import { INDIVIDUAL, PAIR } from '../../constants/participantConstants';
import { QUALIFYING } from '../../constants/drawDefinitionConstants';
import { DOUBLES, TEAM } from '../../constants/eventConstants';

export function getParticipantsCount({
  participantsProfile,
  eventProfiles,
  drawProfiles,
}) {
  let { participantsCount, participantType = INDIVIDUAL } =
    participantsProfile || {};
  const specifiedParicipantsCount = participantsCount || 0; // capture this to ensure calculated participantsCount is not below

  let largestDoublesDraw = 0,
    largestSinglesDraw = 0,
    largestTeamSize = 0,
    largestTeamDraw = 0,
    uniqueParticipantsCount = 0;

  const processDrawProfile = ({
    alternatesCount = 0,
    uniqueParticipants,
    tieFormatName,
    drawSize = 0,
    eventType,
    tieFormat,
    category,
    gender,
    stage,
  }) => {
    const isDoubles = eventType === DOUBLES;
    const isTeam = eventType === TEAM;
    const requiresUniqueParticipants =
      uniqueParticipants || stage === QUALIFYING || category || gender;

    if (requiresUniqueParticipants) {
      if (isDoubles) {
        uniqueParticipantsCount += (drawSize + alternatesCount) * 2;
      } else {
        uniqueParticipantsCount += drawSize + alternatesCount;
      }
    } else {
      if (isTeam) {
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
      ) {
        largestDoublesDraw = drawSize + alternatesCount;
      }

      if (!isDoubles && !isTeam && drawSize && drawSize > largestSinglesDraw) {
        largestSinglesDraw = drawSize + alternatesCount;
      }
    }
  };

  let categories = []; // use when generating participants

  eventProfiles?.forEach((eventProfile) => {
    const {
      tieFormatName: eventTieFormatName,
      tieFormat: eventTieFormat,
      drawProfiles,
      eventType,
      category,
      gender,
    } = eventProfile;

    if (drawProfiles) {
      for (const drawProfile of drawProfiles) {
        const { tieFormatName, tieFormat } = drawProfile;

        processDrawProfile({
          ...drawProfile,
          tieFormatName: tieFormatName || eventTieFormatName,
          tieFormat: tieFormat || eventTieFormat,
          eventType,
          category,
          gender,
        });
      }
    } else {
      if (category) {
        categories.push(category);
        console.log({ categories });
      }
    }
  });

  if (Array.isArray(drawProfiles)) {
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

  // if (participantsCount === undefined) participantsCount = 32;
  if (participantsCount === undefined) {
    participantsCount =
      !eventProfiles?.length && !drawProfiles?.length ? 32 : 0;
  }
  if (participantsCount < specifiedParicipantsCount)
    participantsCount = specifiedParicipantsCount;

  return {
    largestTeamDraw,
    largestTeamSize,
    participantsCount,
    participantType,
    uniqueParticipantsCount,
  };
}

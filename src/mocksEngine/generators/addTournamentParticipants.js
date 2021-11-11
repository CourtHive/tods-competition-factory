import { generateTeamsFromParticipantAttribute } from '../../tournamentEngine/generators/teamsGenerator';
import { addParticipants } from '../../tournamentEngine/governors/participantGovernor/addParticipants';
import { getParticipantId } from '../../global/functions/extractors';
import { generateParticipants } from './generateParticipants';
import { getParticipantsCount } from './getParticipantsCount';
import { generateRange, UUID } from '../../utilities';

import { INDIVIDUAL, TEAM } from '../../constants/participantTypes';
import { COMPETITOR } from '../../constants/participantRoles';

export function addTournamentParticipants({
  participantsProfile,
  tournamentRecord,
  eventProfiles,
  drawProfiles,
  startDate,
  uuids,
}) {
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

  return addParticipants({
    tournamentRecord,
    participants: teamParticipants,
  });
}

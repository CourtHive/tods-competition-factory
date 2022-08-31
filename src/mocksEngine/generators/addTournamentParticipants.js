import { generateTeamsFromParticipantAttribute } from '../../tournamentEngine/generators/teamsGenerator';
import { addParticipants } from '../../tournamentEngine/governors/participantGovernor/addParticipants';
import { getParticipantId } from '../../global/functions/extractors';
import { generateParticipants } from './generateParticipants';
import { getParticipantsCount } from './getParticipantsCount';
import { generateRange, UUID } from '../../utilities';

import { INDIVIDUAL, TEAM } from '../../constants/participantConstants';
import { COMPETITOR } from '../../constants/participantRoles';
import { SUCCESS } from '../../constants/resultConstants';

export function addTournamentParticipants({
  participantsProfile = {},
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

  const { teamKey } = participantsProfile || {};

  const { participants } = generateParticipants({
    uuids,
    ...participantsProfile,
    consideredDate: startDate,
    participantsCount,
    participantType,
  });

  let addedCount = 0;
  let result = addParticipants({ tournamentRecord, participants });
  if (result.error) return result;
  addedCount += result.addedCount;

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
    participants: teamParticipants,
    tournamentRecord,
  });
  if (result.error) return result;
  addedCount += result.addedCount;

  return { addedCount, ...SUCCESS };
}

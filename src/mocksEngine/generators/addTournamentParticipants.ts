import { generateTeamsFromParticipantAttribute } from '../../tournamentEngine/generators/teamsGenerator';
import { addParticipants } from '../../tournamentEngine/governors/participantGovernor/addParticipants';
import { getParticipantId } from '../../global/functions/extractors';
import { generateParticipants } from './generateParticipants';
import { getParticipantsCount } from './getParticipantsCount';
import { generateRange, UUID } from '../../utilities';

import { Participant, Tournament } from '../../types/tournamentFromSchema';
import { INDIVIDUAL, TEAM } from '../../constants/participantConstants';
import { ParticipantsProfile } from '../../types/factoryTypes';
import { COMPETITOR } from '../../constants/participantRoles';
import { SUCCESS } from '../../constants/resultConstants';

type AddTournamentParticipantsArgs = {
  participantsProfile?: ParticipantsProfile;
  tournamentRecord: Tournament;
  eventProfiles?: any[];
  drawProfiles?: any[];
  startDate?: string;
  uuids?: string[];
};
export function addTournamentParticipants({
  participantsProfile,
  tournamentRecord,
  eventProfiles,
  drawProfiles,
  startDate,
  uuids,
}: AddTournamentParticipantsArgs) {
  const {
    participantsCount,
    participantType,
    largestTeamDraw,
    largestTeamSize,
    gendersCount,
  } = getParticipantsCount({
    participantsProfile,
    eventProfiles,
    drawProfiles,
  });

  const teamKey = participantsProfile?.teamKey;

  const participants = generateParticipants({
    uuids,
    ...participantsProfile,
    consideredDate: startDate,
    participantsCount,
    participantType,
    gendersCount,
  }).participants as Participant[];

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
  const teamParticipants: any[] = generateRange(0, largestTeamDraw).map(
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

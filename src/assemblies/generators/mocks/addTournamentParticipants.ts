import { createTeamsFromParticipantAttributes } from '@Mutate/participants/createTeamsFromAttributes';
import { addParticipants } from '@Mutate/participants/addParticipants';
import { getParticipantId } from '../../../functions/global/extractors';
import { generateParticipants } from './generateParticipants';
import { getParticipantsCount } from './getParticipantsCount';
import { generateRange } from '@Tools/arrays';

import { Participant, Tournament } from '@Types/tournamentTypes';
import { INDIVIDUAL, TEAM } from '../../../constants/participantConstants';
import { ParticipantsProfile } from '@Types/factoryTypes';
import { COMPETITOR } from '../../../constants/participantRoles';
import { SUCCESS } from '../../../constants/resultConstants';
import { genParticipantId } from './genParticipantId';

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
  const { participantsCount, participantType, largestTeamDraw, largestTeamSize, gendersCount } = getParticipantsCount({
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
    const result = createTeamsFromParticipantAttributes({
      tournamentRecord,
      ...teamKey,
    });
    if (result.error) return result;
  }

  // generate Team participants
  const allIndividualParticipantIds = participants
    .filter(({ participantType }) => participantType === INDIVIDUAL)
    .map(getParticipantId);
  const idPrefix = participantsProfile?.idPrefix ? `${TEAM}-${participantsProfile.idPrefix}` : undefined;
  const teamParticipants: any[] = generateRange(0, largestTeamDraw).map((teamIndex) => {
    const individualParticipantIds = allIndividualParticipantIds.slice(
      teamIndex * largestTeamSize,
      (teamIndex + 1) * largestTeamSize,
    );
    const participantId = genParticipantId({
      index: teamIndex,
      participantType,
      idPrefix,
      uuids,
    });

    return {
      participantName: `Team ${teamIndex + 1}`,
      participantRole: COMPETITOR,
      individualParticipantIds,
      participantType: TEAM,
      participantId,
    };
  });

  result = addParticipants({
    participants: teamParticipants,
    tournamentRecord,
  });
  if (result.error) return result;
  addedCount += result.addedCount;

  return { addedCount, ...SUCCESS };
}

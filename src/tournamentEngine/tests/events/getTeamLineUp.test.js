import { generateTeamTournament } from '../team/generateTestTeamTournament';
import tournamentEngine from '../../sync';

import { INDIVIDUAL, TEAM } from '../../../constants/participantTypes';
import {
  INVALID_PARTICIPANT_TYPE,
  MISSING_PARTICIPANT_ID,
  TEAM_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

it('can retrieve team lineUps', () => {
  let { tournamentRecord, drawId } = generateTeamTournament();

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants: teamParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [TEAM] },
    });
  const { tournamentParticipants: individualParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
    });

  let result = tournamentEngine.getTeamLineUp({ drawId });
  expect(result.error).toEqual(MISSING_PARTICIPANT_ID);
  result = tournamentEngine.getTeamLineUp({ drawId, participantId: 'bosusId' });
  expect(result.error).toEqual(TEAM_NOT_FOUND);
  result = tournamentEngine.getTeamLineUp({
    drawId,
    participantId: individualParticipants[0].participantId,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_TYPE);

  teamParticipants.forEach((participant) => {
    const { participantId } = participant;
    let result = tournamentEngine.getTeamLineUp({ drawId, participantId });
    expect(result.lineUp).toBeUndefined();
  });
});

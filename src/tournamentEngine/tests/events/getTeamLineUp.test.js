import { generateTeamTournament } from '../team/generateTestTeamTournament';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { MISSING_PARTICIPANT_ID } from '../../../constants/errorConditionConstants';
import { INDIVIDUAL, TEAM } from '../../../constants/participantConstants';

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
  expect(result.lineUp).toBeUndefined();
  result = tournamentEngine.getTeamLineUp({
    participantId: individualParticipants[0].participantId,
    drawId,
  });
  expect(result.lineUp).toBeUndefined();

  teamParticipants.forEach((participant) => {
    const { participantId } = participant;
    let result = tournamentEngine.getTeamLineUp({ drawId, participantId });
    expect(result.lineUp).toBeUndefined();
  });
});

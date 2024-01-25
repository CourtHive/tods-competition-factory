import { generateTeamTournament } from '../participants/team/generateTestTeamTournament';
import tournamentEngine from '../../engines/syncEngine';
import { expect, it } from 'vitest';

import { MISSING_PARTICIPANT_ID } from '../../../constants/errorConditionConstants';
import { INDIVIDUAL, TEAM } from '../../../constants/participantConstants';

it('can retrieve team lineUps', () => {
  const { tournamentRecord, drawId } = generateTeamTournament();

  tournamentEngine.setState(tournamentRecord);

  const { participants: teamParticipants } = tournamentEngine.getParticipants({
    participantFilters: { participantTypes: [TEAM] },
  });
  const { participants: individualParticipants } = tournamentEngine.getParticipants({
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
    const result = tournamentEngine.getTeamLineUp({ drawId, participantId });
    expect(result.lineUp).toBeUndefined();
  });
});

import { extractAttributes } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { MISSING_MATCHUPS } from '../../../constants/errorConditionConstants';
import { TEAM_EVENT } from '../../../constants/eventConstants';
import { TEAM_MATCHUP } from '../../../constants/matchUpTypes';

it('can return team statistics', () => {
  const drawSize = 8;
  const tournamentRecord = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ eventType: TEAM_EVENT, drawSize }],
    completeAllMatchUps: true,
  }).tournamentRecord;

  tournamentEngine.setState(tournamentRecord);

  let result = tournamentEngine.getParticipantStats({ matchUps: [] });
  expect(result.error).toEqual(MISSING_MATCHUPS);

  result = tournamentEngine.getParticipantStats({ withScaleValues: true });

  expect(result.participatingTeamsCount).toEqual(drawSize);
  expect(result.allParticipantStats.length).toEqual(drawSize);

  const matchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM_MATCHUP] },
  }).matchUps;
  const sideParticipantIds = matchUps[0].sides.map(
    extractAttributes('participantId')
  );

  const [teamParticipantId, opponentParticipantId] = sideParticipantIds;
  const teamParticiapntName = matchUps[0].sides[0].participant.participantName;

  result = tournamentEngine.getParticipantStats({
    withIndividualStats: true,
    teamParticipantId,
  });
  expect(result.allParticipantStats[0].participantName).toEqual(
    teamParticiapntName
  );
  result.allParticipantStats.forEach((stats) =>
    expect(stats.participantName).toBeDefined()
  );

  result = tournamentEngine.getParticipantStats({
    withIndividualStats: true,
    opponentParticipantId,
    teamParticipantId,
  });

  expect(result.allParticipantStats.length).toEqual(2);
});

import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';

import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import { COMPLETED } from '../../../constants/matchUpStatusConstants';
import {
  INVALID_MATCHUP,
  INVALID_VALUES,
  VALUE_UNCHANGED,
} from '../../../constants/errorConditionConstants';

test('groupValue can be used in tieFormats', () => {
  const mockProfile = {
    tournamentName: 'Brewer',
    drawProfiles: [
      { drawSize: 4, tieFormatName: 'USTA_BREWER_CUP', eventType: 'TEAM' },
    ],
  };

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord(mockProfile);

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants } =
    tournamentEngine.getTournamentParticipants();
  expect(tournamentParticipants.length).toEqual(40);

  let { matchUps: singlesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES] },
  });
  expect(singlesMatchUps.length).toEqual(18);

  const { matchUps: doublesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [DOUBLES] },
  });
  expect(doublesMatchUps.length).toEqual(9);

  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: COMPLETED,
    scoreString: '6-1 6-1',
    winningSide: 1,
  });
  const singlesMatchUpId = singlesMatchUps[0].matchUpId;
  let result = tournamentEngine.setMatchUpStatus({
    matchUpId: singlesMatchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  let { matchUps: teamMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  });
  expect(teamMatchUps[0].score.sets[0].side1Score).toEqual(1);

  const doublesMatchUpId = doublesMatchUps[0].matchUpId;
  result = tournamentEngine.setMatchUpStatus({
    matchUpId: doublesMatchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  teamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  }).matchUps;
  // expect that the score has NOT changed because groupValue winCriteria not met
  expect(teamMatchUps[0].score.sets[0].side1Score).toEqual(1);

  // complete all first round doublesMatchUps
  doublesMatchUps
    .filter(({ roundNumber }) => roundNumber === 1)
    .forEach(({ matchUpId }) => {
      result = tournamentEngine.setMatchUpStatus({
        matchUpId,
        outcome,
        drawId,
      });
      expect(result.success).toEqual(true);
    });

  teamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  }).matchUps;

  // expect that first team matchUp now has awarded 1 for winning doubles group
  expect(teamMatchUps[0].score.sets[0].side1Score).toEqual(2);

  // expect that second team matchUp now has awarded 1 for winning doubles group
  expect(teamMatchUps[1].score.sets[0].side1Score).toEqual(1);

  // complete all first round singlesMatchUps
  singlesMatchUps
    .filter(({ roundNumber }) => roundNumber === 1)
    .forEach(({ matchUpId }) => {
      result = tournamentEngine.setMatchUpStatus({
        matchUpId,
        outcome,
        drawId,
      });
      expect(result.success).toEqual(true);
    });

  teamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM], roundNumbers: [1] },
  }).matchUps;

  teamMatchUps.forEach((matchUp) => {
    expect(matchUp.score.scoreStringSide1).toEqual('7-0');
  });

  const teamMatchUp = teamMatchUps[0];
  const teamMatchUpId = teamMatchUp.matchUpId;

  // now apply lineUp to the sides of each matchUp
  result = tournamentEngine.applyLineUps({
    matchUpId: teamMatchUpId,
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = tournamentEngine.applyLineUps({
    matchUpId: teamMatchUpId,
    lineUps: {},
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = tournamentEngine.applyLineUps({
    matchUpId: { foo: 'nonStringId' },
    lineUps: [],
    drawId,
  });
  expect(result.error).toEqual(INVALID_MATCHUP);

  result = tournamentEngine.applyLineUps({
    matchUpId: singlesMatchUpId,
    lineUps: [],
    drawId,
  });
  expect(result.error).toEqual(INVALID_MATCHUP);

  result = tournamentEngine.applyLineUps({
    matchUpId: teamMatchUpId,
    lineUps: [],
    drawId,
  });
  expect(result.error).toEqual(VALUE_UNCHANGED);

  // now construct lineUp to apply
  // const { tieFormat } = tournamentEngine.getTieFormat({ drawId });
});

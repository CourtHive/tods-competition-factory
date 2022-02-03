import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';

import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import { COMPLETED } from '../../../constants/matchUpStatusConstants';

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
  let { matchUpId } = singlesMatchUps[0];
  let result = tournamentEngine.setMatchUpStatus({
    matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  let { matchUps: teamMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  });
  expect(teamMatchUps[0].score.sets[0].side1Score).toEqual(1);

  matchUpId = doublesMatchUps[0].matchUpId;
  result = tournamentEngine.setMatchUpStatus({
    matchUpId,
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
});

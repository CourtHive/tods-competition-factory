import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../../tournamentEngine/sync';

it('accurately determines winnerGoesTo and loserGoesTo for FIC matchUps', () => {
  const drawSize = 8;
  const drawProfiles = [{ drawSize }];
  let {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  const {
    matchUps: [{ matchUpId }],
  } = tournamentEngine.allDrawMatchUps({
    drawId,
  });

  const outcome = {
    score: {
      side1ScoreString: '6-1 6-1',
      side2ScoreString: '1-6 1-6',
    },
  };
  const result = tournamentEngine.setDelegatedOutcome({
    drawId,
    matchUpId,
    outcome,
  });
  expect(result.success).toEqual(true);

  const {
    matchUps: [matchUp],
  } = tournamentEngine.allDrawMatchUps({
    drawId,
    inContext: true,
  });

  expect(matchUp._delegatedOutcome).toEqual(outcome);
});

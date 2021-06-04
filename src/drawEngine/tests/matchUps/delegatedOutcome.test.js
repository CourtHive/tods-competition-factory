import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../../tournamentEngine/sync';

it('attached delegated outcomes to matchUps', () => {
  const drawSize = 8;
  const drawProfiles = [{ drawSize }];
  let {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  const {
    matchUps: [{ matchUpId }],
  } = tournamentEngine.setState(tournamentRecord).allDrawMatchUps({
    drawId,
  });

  const outcome = {
    score: {
      scoreStringSide1: '6-1 6-1',
      scoreStringSide2: '1-6 1-6',
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

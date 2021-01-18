import tournamentEngine from '../..';
import { generateTournamentRecord } from '../../../mocksEngine/generators/generateTournamentRecord';
import { FEED_IN_CHAMPIONSHIP } from '../../../constants/drawDefinitionConstants';

it('can return event matchUps with context and upcoming matchUps', () => {
  const drawProfiles = [
    {
      drawSize: 8,
    },
  ];
  const { drawIds, tournamentRecord } = generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  const drawId = drawIds[0];

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allDrawMatchUps({
    drawId,
    nextMatchUps: true,
  });

  // convenience function for testing, expectation:
  // [roundNumber, roundPosition, [winnerToRoundNumber, winnerToRoundPosition], [loserToRoundNumber, loserToRoundPosition]]
  checkExpectation({ matchUps, expectation: [1, 1, [2, 1]] });
  checkExpectation({ matchUps, expectation: [1, 3, [2, 2]] });

  const {
    matchUps: tournamentMatchUps,
  } = tournamentEngine.allTournamentMatchUps({
    nextMatchUps: true,
  });

  const relevantMatchUps = tournamentMatchUps.filter(
    (matchUp) => matchUp.drawId === drawId
  );
  // convenience function for testing, expectation:
  // [roundNumber, roundPosition, [winnerToRoundNumber, winnerToRoundPosition], [loserToRoundNumber, loserToRoundPosition]]
  checkExpectation({
    matchUps: relevantMatchUps,
    expectation: [1, 1, [2, 1]],
  });
  checkExpectation({
    matchUps: relevantMatchUps,
    expectation: [1, 3, [2, 2]],
  });
});

it('can return event matchUps with context and upcoming matchUps for FEED_IN_CHAMPIONSHIP', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      drawType: FEED_IN_CHAMPIONSHIP,
    },
  ];
  const { drawIds, tournamentRecord } = generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  const drawId = drawIds[0];

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allDrawMatchUps({
    drawId,
    nextMatchUps: true,
  });

  // convenience function for testing, expectation:
  // [roundNumber, roundPosition, [winnerToRoundNumber, winnerToRoundPosition], [loserToRoundNumber, loserToRoundPosition]]
  checkExpectation({ matchUps, expectation: [1, 1, [2, 1]] });
  checkExpectation({ matchUps, expectation: [1, 3, [2, 2]] });

  const {
    matchUps: tournamentMatchUps,
  } = tournamentEngine.allTournamentMatchUps({
    nextMatchUps: true,
  });

  const relevantMatchUps = tournamentMatchUps.filter(
    (matchUp) => matchUp.drawId === drawId
  );
  // convenience function for testing, expectation:
  // [roundNumber, roundPosition, [winnerToRoundNumber, winnerToRoundPosition], [loserToRoundNumber, loserToRoundPosition]]
  checkExpectation({
    matchUps: relevantMatchUps,
    expectation: [1, 1, [2, 1], [1, 1]],
  });
  checkExpectation({
    matchUps: relevantMatchUps,
    expectation: [1, 3, [2, 2], [1, 2]],
  });
});

function checkExpectation({ matchUps, expectation }) {
  const [
    roundNumber,
    roundPosition,
    expectedWinnerTo,
    expectedLoserTo,
  ] = expectation;
  const matchUp = matchUps.find(
    (matchUp) =>
      matchUp.roundNumber === roundNumber &&
      matchUp.roundPosition === roundPosition
  );
  const { winnerTo, loserTo } = matchUp;

  if (expectedWinnerTo) {
    const [expectedRoundNumber, expectedRoundPosition] = expectedWinnerTo;
    const {
      roundNumber: targetRoundNumber,
      roundPosition: targetRoundPosition,
    } = { ...winnerTo };
    expect(targetRoundNumber).toEqual(expectedRoundNumber);
    expect(targetRoundPosition).toEqual(expectedRoundPosition);
  }

  if (expectedLoserTo) {
    const [expectedRoundNumber, expectedRoundPosition] = expectedLoserTo;
    const {
      roundNumber: targetRoundNumber,
      roundPosition: targetRoundPosition,
    } = { ...loserTo };
    expect(targetRoundNumber).toEqual(expectedRoundNumber);
    expect(targetRoundPosition).toEqual(expectedRoundPosition);
  }
}

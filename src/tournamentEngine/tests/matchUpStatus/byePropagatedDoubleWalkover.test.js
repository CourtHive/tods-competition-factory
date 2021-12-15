import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';

test('bye propagated double walkover hydration', () => {
  let result = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawSize: 8,
        participantsCount: 6,
        outcomes: [
          {
            roundNumber: 1,
            roundPosition: 3,
            matchUpStatus: 'DOUBLE_WALKOVER',
          },
        ],
      },
    ],
  });

  tournamentEngine.setState(result.tournamentRecord);

  result = tournamentEngine
    .devContext({ WOWO: true })
    .allTournamentMatchUps({ inContext: true });

  const matchUp = result.matchUps.find(
    (m) => m.roundNumber === 3 && m.roundPosition === 1
  );
  expect(matchUp.sides[1].sideNumber).toEqual(2);
  expect(matchUp.sides.length).toEqual(2);
});

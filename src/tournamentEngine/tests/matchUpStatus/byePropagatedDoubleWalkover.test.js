import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';

test('bye propagated double walkover hydration', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
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

  tournamentEngine.setState(tournamentRecord);

  let matchUps = tournamentEngine
    .devContext({ WOWO: true })
    .allTournamentMatchUps().matchUps;
  const matchUp = matchUps.find(
    (m) => m.roundNumber === 3 && m.roundPosition === 1
  );
  console.log(matchUp);
});

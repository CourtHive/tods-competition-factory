import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { DOUBLE_WALKOVER } from '../../../constants/matchUpStatusConstants';

it('generates appropriate sourceMatchUpStatuses in matchUpStatusCodes', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawSize: 4,
        outcomes: [
          {
            roundNumber: 1,
            roundPosition: 1,
            matchUpStatus: DOUBLE_WALKOVER,
          },
          {
            roundNumber: 1,
            roundPosition: 2,
            scoreString: '6-1 6-3',
            winningSide: 1,
          },
        ],
      },
    ],
  });
  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  const matchUp = matchUps.find(({ roundNumber }) => roundNumber === 2);
  expect(
    matchUp.matchUpStatusCodes.map(
      ({ previousMatchUpStatus }) => previousMatchUpStatus
    )
  ).toEqual(['DOUBLE_WALKOVER', 'COMPLETED']);

  /*
      const { outcome } = mocksEngine.generateOutcomeFromScoreString({
        matchUpStatus: TO_BE_PLAYED,
        winningSide: undefined,
      });
      let result = tournamentEngine.setMatchUpStatus({
        matchUpId,
        outcome,
        drawId,
      });
      */
});

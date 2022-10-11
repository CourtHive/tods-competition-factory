import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import {
  DOUBLE_WALKOVER,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';

it('generates appropriate sourceMatchUpStatuses in matchUpStatusCodes', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
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

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  let matchUp = matchUps.find(({ roundNumber }) => roundNumber === 2);

  expect(
    matchUp.matchUpStatusCodes.map(
      ({ previousMatchUpStatus }) => previousMatchUpStatus
    )
  ).toEqual(['DOUBLE_WALKOVER', 'COMPLETED']);

  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: TO_BE_PLAYED,
    winningSide: undefined,
  });

  const matchUpId = matchUps.find(
    ({ roundNumber, roundPosition }) => roundNumber === 1 && roundPosition === 2
  ).matchUpId;

  let result = tournamentEngine.setMatchUpStatus({
    matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  matchUp = matchUps.find(({ roundNumber }) => roundNumber === 2);

  expect(
    matchUp.matchUpStatusCodes.map(
      ({ previousMatchUpStatus }) => previousMatchUpStatus
    )
  ).toEqual(['DOUBLE_WALKOVER', 'TO_BE_PLAYED']);
});

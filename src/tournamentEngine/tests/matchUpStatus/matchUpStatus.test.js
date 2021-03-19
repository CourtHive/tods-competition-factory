import tournamentEngine from '../../sync';
import mocksEngine from '../../../mocksEngine';

import {
  ABANDONED,
  CANCELLED,
  RETIRED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

it('can set every valid matchUpStatus', () => {
  const participantsProfile = {
    participantsCount: 16,
  };
  const drawProfiles = [
    {
      drawSize: 16,
      participantsCount: 15,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          matchUpStatus: ABANDONED,
        },
        {
          roundNumber: 1,
          roundPosition: 3,
          scoreString: '6-1 RET',
          matchUpStatus: RETIRED,
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 4,
          matchUpStatus: WALKOVER,
          winningSide: 1,
        },
      ],
    },
  ];
  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  // there should be 2 completed matchUps: RETIRED and WALKOVER
  result = tournamentEngine.drawMatchUps({
    drawId,
    inContext: true,
  });
  expect(result.completedMatchUps.length).toEqual(2);
  expect(result.abandonedMatchUps.length).toEqual(1);
  expect(result.upcomingMatchUps.length).toEqual(5);
  expect(result.pendingMatchUps.length).toEqual(6);
  expect(result.byeMatchUps.length).toEqual(1);
});

it('removes scores for CANCELLED and WALKOVER outcomes', () => {
  const participantsProfile = {
    participantsCount: 16,
  };
  const drawProfiles = [
    {
      drawSize: 16,
      participantsCount: 16,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 1,
          scoreString: '6-1',
          matchUpStatus: ABANDONED,
        },
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-1',
          matchUpStatus: WALKOVER,
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 3,
          scoreString: '6-1',
          matchUpStatus: CANCELLED,
        },
      ],
    },
  ];
  let {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    drawId,
    inContext: true,
  });

  const abandoned = matchUps.find(
    ({ matchUpStatus }) => matchUpStatus === ABANDONED
  );
  expect(abandoned.score.scoreStringSide1).toEqual('6-1');
  const walkover = matchUps.find(
    ({ matchUpStatus }) => matchUpStatus === WALKOVER
  );
  expect(walkover.score.scoreStringSide1).toEqual('');
  const cancelled = matchUps.find(
    ({ matchUpStatus }) => matchUpStatus === CANCELLED
  );
  expect(cancelled.score.scoreStringSide1).toEqual('');
});

import tournamentEngine from '../../sync';
import mocksEngine from '../../../mocksEngine';

import {
  ABANDONED,
  CANCELLED,
  AWAITING_RESULT,
  IN_PROGRESS,
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

it('allows AWAITING_RESULT status with no outcome', () => {
  const participantsProfile = {
    participantsCount: 16,
  };
  const drawProfiles = [
    {
      drawSize: 16,
      participantsCount: 15,
    },
  ];
  let {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });

  const { upcomingMatchUps } = tournamentEngine.drawMatchUps({ drawId });
  const matchUpId = upcomingMatchUps[0].matchUpId;

  let result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: {
      matchUpStatus: IN_PROGRESS,
    },
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: {
      matchUpStatus: AWAITING_RESULT,
    },
  });
  expect(result.success).toEqual(true);
  expect(result.matchUp.matchUpStatus).toEqual(AWAITING_RESULT);
});

it('does not allow IN_PROGRESS or AWAITING_RESULT status when < 2 drawPositions', () => {
  const participantsProfile = {
    participantsCount: 16,
  };
  const drawProfiles = [
    {
      drawSize: 16,
      participantsCount: 15,
    },
  ];
  let {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });

  const { pendingMatchUps } = tournamentEngine.drawMatchUps({
    drawId,
  });
  const matchUpId = pendingMatchUps[0].matchUpId;

  let result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: {
      matchUpStatus: IN_PROGRESS,
    },
  });
  expect(result.error).not.toBeUndefined();

  result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: {
      matchUpStatus: AWAITING_RESULT,
    },
  });
  expect(result.error).not.toBeUndefined();
});

it('attaches notes to matchUps', () => {
  const participantsProfile = {
    participantsCount: 16,
  };
  const drawProfiles = [
    {
      drawSize: 16,
      participantsCount: 15,
    },
  ];
  let {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });

  const { upcomingMatchUps } = tournamentEngine.drawMatchUps({ drawId });
  const matchUpId = upcomingMatchUps[0].matchUpId;

  const firstNote = 'first note';
  const secondNote = 'second note';
  let result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    notes: firstNote,
    outcome: {
      matchUpStatus: IN_PROGRESS,
    },
  });
  expect(result.matchUp.notes).toEqual(firstNote);
  expect(result.success).toEqual(true);

  result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    notes: secondNote,
    outcome: {
      matchUpStatus: IN_PROGRESS,
    },
  });
  expect(result.matchUp.notes).toEqual(secondNote);
  expect(result.success).toEqual(true);
});

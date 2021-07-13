import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import {
  ABANDONED,
  CANCELLED,
  INCOMPLETE,
  SUSPENDED,
  IN_PROGRESS,
  NOT_PLAYED,
  DEAD_RUBBER,
  AWAITING_RESULT,
} from '../../../constants/matchUpStatusConstants';

it('supports entering CANCELED matchUpStatus', () => {
  const drawProfiles = [
    {
      drawSize: 8,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  const { upcomingMatchUps } = tournamentEngine
    .setState(tournamentRecord)
    .drawMatchUps({ drawId });
  const matchUpId = upcomingMatchUps[0].matchUpId;

  const result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: { matchUpStatus: CANCELLED },
  });
  expect(result.success).toEqual(true);

  const { matchUp } = tournamentEngine.findMatchUp({ drawId, matchUpId });
  expect(matchUp.matchUpStatus).toEqual(CANCELLED);
});

it('supports entering ABANDONED matchUpStatus', () => {
  const drawProfiles = [
    {
      drawSize: 8,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  const { upcomingMatchUps } = tournamentEngine
    .setState(tournamentRecord)
    .drawMatchUps({ drawId });
  const matchUpId = upcomingMatchUps[0].matchUpId;

  const result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: { matchUpStatus: ABANDONED },
  });
  expect(result.success).toEqual(true);

  const { matchUp } = tournamentEngine.findMatchUp({ drawId, matchUpId });
  expect(matchUp.matchUpStatus).toEqual(ABANDONED);
});

it('supports entering INCOMPLETE matchUpStatus', () => {
  const drawProfiles = [
    {
      drawSize: 8,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  const { upcomingMatchUps } = tournamentEngine
    .setState(tournamentRecord)
    .drawMatchUps({ drawId });
  const matchUpId = upcomingMatchUps[0].matchUpId;

  const result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: { matchUpStatus: INCOMPLETE },
  });
  expect(result.success).toEqual(true);

  const { matchUp } = tournamentEngine.findMatchUp({ drawId, matchUpId });
  expect(matchUp.matchUpStatus).toEqual(INCOMPLETE);
});

it('supports entering SUSPENDED matchUpStatus', () => {
  const drawProfiles = [
    {
      drawSize: 8,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  const { upcomingMatchUps } = tournamentEngine
    .setState(tournamentRecord)
    .drawMatchUps({ drawId });
  const matchUpId = upcomingMatchUps[0].matchUpId;

  const result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: { matchUpStatus: SUSPENDED },
  });
  expect(result.success).toEqual(true);

  const { matchUp } = tournamentEngine.findMatchUp({ drawId, matchUpId });
  expect(matchUp.matchUpStatus).toEqual(SUSPENDED);
});

it('supports entering DEAD_RUBBER matchUpStatus', () => {
  const drawProfiles = [
    {
      drawSize: 8,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  const { upcomingMatchUps } = tournamentEngine
    .setState(tournamentRecord)
    .drawMatchUps({ drawId });
  const matchUpId = upcomingMatchUps[0].matchUpId;

  const result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: { matchUpStatus: DEAD_RUBBER },
  });
  expect(result.success).toEqual(true);

  const { matchUp } = tournamentEngine.findMatchUp({ drawId, matchUpId });
  expect(matchUp.matchUpStatus).toEqual(DEAD_RUBBER);
});

it('supports entering NOT_PLAYED matchUpStatus', () => {
  const drawProfiles = [
    {
      drawSize: 8,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  const { upcomingMatchUps } = tournamentEngine
    .setState(tournamentRecord)
    .drawMatchUps({ drawId });
  const matchUpId = upcomingMatchUps[0].matchUpId;

  const result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: { matchUpStatus: NOT_PLAYED },
  });
  expect(result.success).toEqual(true);

  const { matchUp } = tournamentEngine.findMatchUp({ drawId, matchUpId });
  expect(matchUp.matchUpStatus).toEqual(NOT_PLAYED);
});

it('supports entering IN_PROGRESS matchUpStatus', () => {
  const drawProfiles = [
    {
      drawSize: 8,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  const { upcomingMatchUps } = tournamentEngine
    .setState(tournamentRecord)
    .drawMatchUps({ drawId });
  const matchUpId = upcomingMatchUps[0].matchUpId;

  const result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: { matchUpStatus: IN_PROGRESS },
  });
  expect(result.success).toEqual(true);

  const { matchUp } = tournamentEngine.findMatchUp({ drawId, matchUpId });
  expect(matchUp.matchUpStatus).toEqual(IN_PROGRESS);
});

it('supports entering AWAITING_RESULT matchUpStatus', () => {
  const drawProfiles = [
    {
      drawSize: 8,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  const { upcomingMatchUps } = tournamentEngine
    .setState(tournamentRecord)
    .drawMatchUps({ drawId });
  const matchUpId = upcomingMatchUps[0].matchUpId;

  const result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: { matchUpStatus: AWAITING_RESULT },
  });
  expect(result.success).toEqual(true);

  const { matchUp } = tournamentEngine.findMatchUp({ drawId, matchUpId });
  expect(matchUp.matchUpStatus).toEqual(AWAITING_RESULT);
});

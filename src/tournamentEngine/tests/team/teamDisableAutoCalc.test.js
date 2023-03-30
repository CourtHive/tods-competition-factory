import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { TEAM_MATCHUP } from '../../../constants/matchUpTypes';
import { TEAM_EVENT } from '../../../constants/eventConstants';

it('supports disabling and then re-enabling auto-Calc', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    eventProfiles: [
      {
        // completionGoal of 5 will compelte 1 DOUBLES in each first round TEAM matchUp
        // and then 1 SINGLES matchUp in one TEAM matchUp, which will compelte 1 TEAM matchUp
        drawProfiles: [{ drawSize: 8, completionGoal: 5 }],
        eventType: TEAM_EVENT,
      },
    ],
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const { completedMatchUps, pendingMatchUps } =
    tournamentEngine.tournamentMatchUps();

  // completing 5 DOUBLES/SINGLES resulted in one first round TEAM match being completed
  expect(completedMatchUps.length).toEqual(6);

  let targetTeamMatchUp = completedMatchUps.find(
    ({ matchUpType }) => matchUpType === TEAM_MATCHUP
  );
  let winnerTeamMatchUp = pendingMatchUps.find(
    (matchUp) => matchUp.matchUpId === targetTeamMatchUp.winnerMatchUpId
  );

  const {
    matchUpId,
    drawId,
    winningSide: originalWinningSide,
  } = targetTeamMatchUp;

  // in this case winningSide happens to equal drawPosition... because matchUp is { roundNumber : 1, roundPosition: 1 }
  let { matchUpId: winnerTeamMatchUpId, drawPositions: originalDrawPositions } =
    winnerTeamMatchUp;
  expect(originalDrawPositions).toEqual([originalWinningSide]);

  // now manually change the team score to not match the calculated score
  result = tournamentEngine.setMatchUpStatus({
    outcome: { winningSide: 3 - originalWinningSide },
    disableAutoCalc: true,
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  targetTeamMatchUp = tournamentEngine.findMatchUp({
    drawId,
    matchUpId,
  }).matchUp;
  expect(targetTeamMatchUp.winningSide).toEqual(3 - originalWinningSide);
  winnerTeamMatchUp = tournamentEngine.findMatchUp({
    matchUpId: winnerTeamMatchUpId,
    drawId,
  }).matchUp;
  expect(winnerTeamMatchUp.drawPositions).toEqual([3 - originalWinningSide]);

  result = tournamentEngine.enableTieAutoCalc({
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  targetTeamMatchUp = tournamentEngine.findMatchUp({
    matchUpId,
    drawId,
  }).matchUp;

  expect(originalWinningSide).toEqual(targetTeamMatchUp.winningSide);

  winnerTeamMatchUp = tournamentEngine.findMatchUp({
    matchUpId: winnerTeamMatchUpId,
    drawId,
  }).matchUp;
  expect(originalDrawPositions).toEqual(winnerTeamMatchUp.drawPositions);
});

it('disabled auto calc with manually advanced team will not advance calculated winner on scoring', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    eventProfiles: [
      {
        // completionGoal of 5 will compelte 1 DOUBLES in each first round TEAM matchUp
        // and then 1 SINGLES matchUp in one TEAM matchUp, which will compelte 1 TEAM matchUp
        drawProfiles: [{ drawSize: 8, completionGoal: 5 }],
        eventType: TEAM_EVENT,
      },
    ],
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const { completedMatchUps, pendingMatchUps } =
    tournamentEngine.tournamentMatchUps();

  // completing 5 DOUBLES/SINGLES resulted in one first round TEAM match being completed
  expect(completedMatchUps.length).toEqual(6);

  let targetTeamMatchUp = completedMatchUps.find(
    ({ matchUpType }) => matchUpType === TEAM_MATCHUP
  );
  let winnerTeamMatchUp = pendingMatchUps.find(
    (matchUp) => matchUp.matchUpId === targetTeamMatchUp.winnerMatchUpId
  );

  const {
    winningSide: originalWinningSide,
    matchUpId,
    drawId,
  } = targetTeamMatchUp;

  // in this case winningSide happens to equal drawPosition... because matchUp is { roundNumber : 1, roundPosition: 1 }
  let { matchUpId: winnerTeamMatchUpId, drawPositions: originalDrawPositions } =
    winnerTeamMatchUp;
  expect(originalDrawPositions).toEqual([originalWinningSide]);

  // now manually change the team score to not match the calculated score
  result = tournamentEngine.setMatchUpStatus({
    outcome: { winningSide: 3 - originalWinningSide },
    disableAutoCalc: true,
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  targetTeamMatchUp = tournamentEngine.findMatchUp({
    matchUpId,
    drawId,
  }).matchUp;
  expect(targetTeamMatchUp.winningSide).toEqual(3 - originalWinningSide);
  expect(targetTeamMatchUp._disableAutoCalc).toEqual(true);

  winnerTeamMatchUp = tournamentEngine.findMatchUp({
    matchUpId: winnerTeamMatchUpId,
    drawId,
  }).matchUp;
  expect(winnerTeamMatchUp.drawPositions).toEqual([3 - originalWinningSide]);

  const incompleteSingles = targetTeamMatchUp.tieMatchUps.find(
    ({ readyToScore }) => readyToScore
  );
  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    winningSide: originalWinningSide,
    scoreString: '7-5 7-5',
  });

  result = tournamentEngine.setMatchUpStatus({
    matchUpId: incompleteSingles.matchUpId,
    outcome,
    drawId,
  });

  // because automatic score calculation is still disabled we expect no change from the manual override
  targetTeamMatchUp = tournamentEngine.findMatchUp({
    matchUpId,
    drawId,
  }).matchUp;
  expect(targetTeamMatchUp.winningSide).not.toEqual(originalWinningSide);

  winnerTeamMatchUp = tournamentEngine.findMatchUp({
    matchUpId: winnerTeamMatchUpId,
    drawId,
  }).matchUp;
  expect(winnerTeamMatchUp.drawPositions).not.toEqual([originalDrawPositions]);
});

import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';
import { generateTeamTournament } from './generateTestTeamTournament';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { COMPLETED } from '../../../constants/matchUpStatusConstants';
import { SINGLES, TEAM } from '../../../constants/matchUpTypes';

import { setDevContext } from '../../../global/state/globalState';

const getMatchUp = (id, inContext) => {
  const {
    matchUps: [matchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpIds: [id] },
    inContext,
  });
  return matchUp;
};

test('positionActions work when team score is 0-0', () => {
  const { tournamentRecord } = generateTeamTournament({
    drawSize: 8,
    singlesCount: 3,
    doublesCount: 0,
    valueGoal: 2,
  });

  tournamentEngine.setState(tournamentRecord);

  let {
    matchUps: [firstDualMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM], roundNumbers: [1] },
  });

  const { drawId, structureId } = firstDualMatchUp;

  let result = tournamentEngine.positionActions({
    drawPosition: 1,
    structureId,
    drawId,
  });
  let validActions = result.validActions.map(({ type }) => type);
  expect(validActions.includes('SWAP')).toEqual(true);

  // generate outcome to be applied to each first round singles matchUp
  let { outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: COMPLETED,
    scoreString: '6-1 6-1',
    winningSide: 1,
  });

  processOutcome({
    dualMatchUp: firstDualMatchUp,
    expectedScore: '3-0',
    outcome,
  });

  result = tournamentEngine.positionActions({
    drawPosition: 1,
    structureId,
    drawId,
  });
  validActions = result.validActions.map(({ type }) => type);
  expect(validActions.includes('SWAP')).toEqual(false);

  // remove outcome
  processOutcome({
    dualMatchUp: firstDualMatchUp,
    expectedScore: '0-0',
    outcome: toBePlayed,
  });

  setDevContext({ positionActions: true });

  result = tournamentEngine.positionActions({
    drawPosition: 1,
    structureId,
    drawId,
  });
  validActions = result.validActions.map(({ type }) => type);
  expect(validActions.includes('SWAP')).toEqual(true);
});

function processOutcome({ dualMatchUp, outcome, expectedScore }) {
  const singlesMatchUps = dualMatchUp.tieMatchUps.filter(
    ({ matchUpType }) => matchUpType === SINGLES
  );
  const { drawId } = dualMatchUp;
  singlesMatchUps.forEach((singlesMatchUp) => {
    const { matchUpId } = singlesMatchUp;
    let result = tournamentEngine.setMatchUpStatus({
      matchUpId,
      outcome,
      drawId,
    });
    expect(result.success).toEqual(true);
  });
  const updatedDualMatchUp = getMatchUp(dualMatchUp.matchUpId);
  const {
    score: { scoreStringSide1 },
  } = updatedDualMatchUp;

  expect(scoreStringSide1).toEqual(expectedScore);
}

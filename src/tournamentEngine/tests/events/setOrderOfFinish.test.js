import { generateTeamTournament } from '../team/generateTestTeamTournament';
import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';
import { expect, it } from 'vitest';

import { COMPLETED } from '../../../constants/matchUpStatusConstants';
import { MAIN } from '../../../constants/drawDefinitionConstants';
import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import {
  INVALID_MATCHUP_STATUS,
  INVALID_VALUES,
} from '../../../constants/errorConditionConstants';

it('can both assign and remove individualParticipants in SINGLES matchUps that are part of team events', () => {
  const { tournamentRecord, drawId } = generateTeamTournament({
    singlesCount: 6,
    doublesCount: 3,
    drawSize: 4,
  });
  tournamentEngine.setState(tournamentRecord);

  let {
    matchUps: [dualMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    contextFilters: {
      stages: [MAIN],
    },
    matchUpFilters: {
      matchUpTypes: [TEAM],
      roundNumbers: [1],
    },
  });

  let { outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: COMPLETED,
    scoreString: '6-1 6-1',
    winningSide: 1,
  });

  const singlesMatchUps = dualMatchUp.tieMatchUps.filter(
    ({ matchUpType }) => matchUpType === SINGLES
  );
  expect(singlesMatchUps.length).toEqual(6);

  singlesMatchUps.slice(0, 3).forEach((singlesMatchUp) => {
    const { matchUpId } = singlesMatchUp;
    let result = tournamentEngine.setMatchUpStatus({
      matchUpId,
      outcome,
      drawId,
    });
    expect(result.success).toEqual(true);
  });

  const doublesMatchUps = dualMatchUp.tieMatchUps.filter(
    ({ matchUpType }) => matchUpType === DOUBLES
  );
  expect(doublesMatchUps.length).toEqual(3);

  doublesMatchUps.slice(0, 1).forEach((doublesMatchUp) => {
    const { matchUpId } = doublesMatchUp;
    let result = tournamentEngine.setMatchUpStatus({
      matchUpId,
      outcome,
      drawId,
    });
    expect(result.success).toEqual(true);
  });

  // expect an error because no finishingOrder has been provided
  let result = tournamentEngine.setOrderOfFinish({ drawId });
  expect(result.error).toEqual(INVALID_VALUES);

  // attempt to assign orderOfFinish to all singlesMatchUps
  // expect an error because orderOfFinish value is 0
  let finishingOrder = singlesMatchUps
    .slice(0, 3)
    .map(({ matchUpId }, index) => ({
      orderOfFinish: index,
      matchUpId,
    }));
  result = tournamentEngine.setOrderOfFinish({
    finishingOrder,
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  // attempt to assign orderOfFinish to all singlesMatchUps
  // expect an error because not all singlesMatchUps have been completed
  finishingOrder = singlesMatchUps.map(({ matchUpId }, index) => ({
    orderOfFinish: index + 1,
    matchUpId,
  }));
  result = tournamentEngine.setOrderOfFinish({
    finishingOrder,
    drawId,
  });
  expect(result.error).toEqual(INVALID_MATCHUP_STATUS);

  // attempt to assign orderOfFinish to all tieMatchUps
  // expect an error because not all tieMatchUps are the same matchUpType
  finishingOrder = dualMatchUp.tieMatchUps.map(({ matchUpId }, index) => ({
    orderOfFinish: index + 1,
    matchUpId,
  }));
  result = tournamentEngine.setOrderOfFinish({
    finishingOrder,
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  // attempt to assign orderOfFinish to all singlesMatchUps
  // expect failure because orderOfFinish values are not unique
  finishingOrder = singlesMatchUps.slice(0, 3).map(({ matchUpId }) => ({
    orderOfFinish: 1,
    matchUpId,
  }));
  result = tournamentEngine.setOrderOfFinish({
    finishingOrder,
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  // attempt to assign orderOfFinish to all singlesMatchUps
  finishingOrder = singlesMatchUps.slice(0, 3).map(({ matchUpId }, index) => ({
    orderOfFinish: index + 1,
    matchUpId,
  }));
  result = tournamentEngine.setOrderOfFinish({
    finishingOrder,
    drawId,
  });
  expect(result.success).toEqual(true);
});

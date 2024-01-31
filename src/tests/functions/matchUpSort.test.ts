import { matchUpSort } from '@Functions/sorters/matchUpSort';
import mocksEngine from '../../assemblies/engines/mock';
import queryEngine from '../engines/queryEngine';
import { shuffleArray } from '@Tools/arrays';
import { it, expect } from 'vitest';

import { COMPASS, CURTIS_CONSOLATION, stageOrder } from '@Constants/drawDefinitionConstants';

it.each([COMPASS, CURTIS_CONSOLATION])('can accurately sort matchUps by stage and then stageSequence', (drawType) => {
  const drawSize = 32;
  const drawProfiles = [{ drawType, drawSize }];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });
  queryEngine.setState(tournamentRecord);

  const { matchUps } = queryEngine.allTournamentMatchUps();
  const shuffledMatchUps = shuffleArray(matchUps);
  const sortedMatchUps = shuffledMatchUps.sort(matchUpSort);
  const sortedState = sortedMatchUps.map(({ stage, stageSequence, roundNumber, roundPosition }) => [
    stageOrder[stage],
    stageSequence,
    roundNumber,
    roundPosition,
  ]);

  let lastHash = 0;
  const properSort = sortedState.every((stateValue) => {
    const stateHash = stateValue.reverse().reduce((hash, value, index) => {
      return hash + value * Math.pow(100, index);
    }, 0);
    if (stateHash < lastHash) return false;
    lastHash = stateHash;
    return true;
  });
  expect(properSort).toEqual(true);
});

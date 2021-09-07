import { getMatchUpDependencies } from '../scheduleMatchUps/getMatchUpDependencies';
import mocksEngine from '../../../../mocksEngine';
import { tournamentEngine } from '../../../..';

import { COMPASS } from '../../../../constants/drawDefinitionConstants';

it.each([
  { drawSize: 4, dependencyMap: { 1: 0, 2: 2 } },
  { drawSize: 32, dependencyMap: { 1: 0, 2: 2, 3: 6, 4: 14, 5: 30 } },
])('can clear scheduled matchUps', ({ drawSize, dependencyMap }) => {
  const drawProfiles = [{ drawSize }];
  const startDate = '2022-01-01';
  const endDate = '2022-01-07';
  const { drawIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    startDate,
    endDate,
  });

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  const { matchUpDependencies } = getMatchUpDependencies({
    matchUps,
    drawIds,
  });

  const { roundMatchUps } = tournamentEngine.getRoundMatchUps({
    matchUps,
  });

  Object.keys(dependencyMap).forEach((roundNumber) => {
    roundMatchUps[roundNumber].forEach(({ matchUpId }) =>
      expect(matchUpDependencies[matchUpId].length).toEqual(
        dependencyMap[roundNumber]
      )
    );
  });
});

it('can build a dependency map across structures', () => {
  const drawProfiles = [{ drawSize: 32, drawType: COMPASS }];
  const startDate = '2022-01-01';
  const endDate = '2022-01-07';
  const { drawIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    startDate,
    endDate,
  });

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  const { matchUpDependencies } = getMatchUpDependencies({
    matchUps,
    drawIds,
  });

  const targetMatchUp = matchUps.find(
    ({ structureName, roundNumber }) =>
      structureName === 'WEST' && roundNumber === 1
  );
  const dependencies = matchUpDependencies[targetMatchUp.matchUpId];
  matchUps
    .filter(({ matchUpId }) => dependencies.includes(matchUpId))
    .forEach(({ structureName, roundNumber, roundPosition }) => {
      expect(structureName).toEqual('EAST');
      expect(roundNumber).toEqual(1);
      expect([1, 2].includes(roundPosition)).toEqual(true);
    });
});

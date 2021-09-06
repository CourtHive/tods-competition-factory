import { getMatchUpDependencies } from '../scheduleMatchUps/getMatchUpDependencies';
import mocksEngine from '../../../../mocksEngine';
import { tournamentEngine } from '../../../..';

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

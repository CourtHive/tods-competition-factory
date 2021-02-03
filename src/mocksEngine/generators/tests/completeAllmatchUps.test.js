import mocksEngine from '../..';
import tournamentEngine from '../../../tournamentEngine';
import { instanceCount } from '../../../utilities';

it('can generate a tournament with all results completed', () => {
  const drawProfiles = [{ drawSize: 32 }];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    drawProfiles,
  });
  tournamentEngine.setState(tournamentRecord);
  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  const matchUpStatuses = instanceCount(matchUps.map((m) => m.matchUpStatus));
  expect(matchUpStatuses.COMPLETED).toEqual(31);
});

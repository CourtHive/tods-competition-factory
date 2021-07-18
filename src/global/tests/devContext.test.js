import competitionEngine from '../../competitionEngine/sync';
import tournamentEngine from '../../tournamentEngine/sync';

it('handles devContext objects', () => {
  let result = tournamentEngine.devContext(true);
  expect(result.success).toBeUndefined();

  let devContext = tournamentEngine.getDevContext();
  expect(devContext).toEqual(true);

  result = tournamentEngine.devContext({ WOWO: true });
  expect(result.success).toBeUndefined();
  devContext = tournamentEngine.getDevContext();
  expect(devContext).toEqual({ WOWO: true });

  devContext = tournamentEngine.getDevContext({ WOWO: true });
  expect(devContext).toEqual(true);

  // providing getDevContext with a object to match produces false when there are not matching properties
  devContext = tournamentEngine.getDevContext({ FOO: true });
  expect(devContext).toEqual(false);

  // devContext is in shared state
  devContext = competitionEngine.getDevContext();
  expect(devContext).toEqual({ WOWO: true });
});

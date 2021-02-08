import competitionEngine from '../../competitionEngine/sync';
import drawEngine from '../../drawEngine/sync';
import mocksEngine from '../../mocksEngine';
import tournamentEngine from '../../tournamentEngine/sync';

it('can return version from all engines', () => {
  let result = drawEngine.version();
  expect(result).not.toBeUndefined();
  result = tournamentEngine.version();
  expect(result).not.toBeUndefined();
  result = competitionEngine.version();
  expect(result).not.toBeUndefined();
  result = mocksEngine.version();
  expect(result).not.toBeUndefined();
});

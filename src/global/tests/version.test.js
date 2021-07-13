import competitionEngine from '../../competitionEngine/sync';
import tournamentEngine from '../../tournamentEngine/sync';
import drawEngine from '../../drawEngine/sync';
import mocksEngine from '../../mocksEngine';

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

it('can return credits from all engines', () => {
  let result = drawEngine.credits();
  expect(result).not.toBeUndefined();
  result = tournamentEngine.credits();
  expect(result).not.toBeUndefined();
  result = competitionEngine.credits();
  expect(result).not.toBeUndefined();
  result = mocksEngine.credits();
  expect(result).not.toBeUndefined();
});

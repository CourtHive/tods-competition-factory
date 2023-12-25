import competitionEngine from '../../tests/engines/competitionEngine';
import tournamentEngine from '../../tests/engines/syncEngine';
import mocksEngine from '../../mocksEngine';
import { expect, it } from 'vitest';

it('can return version from all engines', () => {
  let result = tournamentEngine.version();
  expect(result).not.toBeUndefined();
  result = competitionEngine.version();
  expect(result).not.toBeUndefined();
  result = mocksEngine.version();
  expect(result).not.toBeUndefined();
});

it('can return credits from all engines', () => {
  let result = tournamentEngine.credits();
  console.log(result);
  expect(result).not.toBeUndefined();
  result = competitionEngine.credits();
  expect(result).not.toBeUndefined();
  result = mocksEngine.credits();
  expect(result).not.toBeUndefined();
});

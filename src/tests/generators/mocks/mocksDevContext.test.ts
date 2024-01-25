import { expect, test } from 'vitest';
import mocksEngine from '../../../assemblies/engines/mock';

test('mocksEngine supports devContext', () => {
  const { tournamentRecord } = mocksEngine.devContext(true).generateTournamentRecord();
  expect(tournamentRecord).not.toBeUndefined();
});

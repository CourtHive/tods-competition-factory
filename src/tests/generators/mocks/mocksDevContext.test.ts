import { expect, test } from 'vitest';
import mocksEngine from '@Assemblies/engines/mock';

test('mocksEngine supports devContext', () => {
  const { tournamentRecord } = mocksEngine.devContext(true).generateTournamentRecord();
  expect(tournamentRecord).not.toBeUndefined();
});

import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

it('supports adding onlineResources for tournaments', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    tournamentName: 'Online Resources',
  });
  expect(tournamentRecord.onlineResources?.length ?? 0).toEqual(0);

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const onlineResource = {
    identifier: 'http://someUrl/some.jpg',
    resourceSubType: 'IMAGE',
    name: 'tournamentImage',
    resourceType: 'URL',
  };

  result = tournamentEngine.addOnlineResource({ onlineResource });
  expect(result.success).toEqual(true);

  const tournament = tournamentEngine.getState().tournamentRecord;
  expect(tournament.onlineResources.length).toEqual(1);
});

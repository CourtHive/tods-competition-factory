import tournamentEngine from '../engines/syncEngine';
import { xa } from '@Tools/extractAttributes';
import mocksEngine from '../../assemblies/engines/mock';
import { numericSort } from '@Tools/sorting';
import { it, expect } from 'vitest';
import { unique } from '@Tools/arrays';

it('can extract values from object', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 16 }],
    completeAllMatchUps: true,
  });
  const result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const participants = tournamentEngine.getParticipants({
    withMatchUps: true,
    withEvents: true,
  }).participants;

  expect(participants[0].matchUps.length).toEqual(participants[0].matchUps.map(xa('matchUpId')).length);

  const matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  const matchUpIds = matchUps.map(xa('matchUpId')).filter(Boolean);
  expect(matchUps.length).toEqual(matchUpIds.length);

  const matchUpSidesWithParticipants = matchUps.flatMap(xa('sides')).filter(xa('participant'));
  expect(matchUpSidesWithParticipants.length).toEqual(30);
  const sideNumbers = unique(matchUpSidesWithParticipants.map(xa('sideNumber')).sort(numericSort));
  expect(sideNumbers).toEqual([1, 2]);
});

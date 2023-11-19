import { resolveTournamentRecord } from '../accessors/resolveTournamentRecord';
import mocksEngine from '../../mocksEngine';
import { expect, it } from 'vitest';

import { allTournamentMatchUps } from '../../forge/query';
import {
  MISSING_TOURNAMENT_ID,
  MISSING_VALUE,
} from '../../constants/errorConditionConstants';

it('can resolve tournamentRecords', () => {
  const {
    tournamentRecord: t1,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({ drawProfiles: [{ drawSize: 8 }] });
  const {
    tournamentRecord: t2,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({ drawProfiles: [{ drawSize: 8 }] });

  const tournamentRecords = { [t1.tournamentId]: t1, [t2.tournamentId]: t2 };

  const noTournamentId = resolveTournamentRecord({
    method: allTournamentMatchUps,
    tournamentRecords,
  });

  expect(noTournamentId.error).toEqual(MISSING_TOURNAMENT_ID);

  // @ts-expect-error testing for error on no method param
  const fail = resolveTournamentRecord({
    tournamentRecords,
    drawId,
  });
  expect(fail.error).toEqual(MISSING_VALUE);

  const r1 = resolveTournamentRecord({
    method: allTournamentMatchUps,
    tournamentRecords,
    drawId,
  });
  expect(r1.matchUps).toBeDefined();

  const r2 = resolveTournamentRecord({
    method: allTournamentMatchUps,
    tournamentRecords,
    eventId,
  });
  expect(r2.matchUps.length).toBeDefined();
});

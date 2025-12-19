import tournamentEngine from '@Engines/syncEngine';
import mocksEngine from '@Assemblies/engines/mock';
import { expect, it } from 'vitest';

// constants and fixtures
import { POLICY_ROUND_NAMING_DEFAULT } from '@Fixtures/policies/POLICY_ROUND_NAMING_DEFAULT';

it('can hydrate roundNames in tournamentRecords', () => {
  const participantsCount = 16;
  const eventId = 'eventId';

  mocksEngine.generateTournamentRecord({
    eventProfiles: [{ eventId, drawProfiles: [{ drawSize: participantsCount }] }],
    setState: true,
  });

  let matchUps = tournamentEngine.allTournamentMatchUps({ inContext: false }).matchUps;
  let matchUpsWithRoundNames = matchUps.filter((m) => m.roundNumber && m.roundName);
  expect(matchUpsWithRoundNames.length).toEqual(0);

  tournamentEngine.hydrateTournamentRecord({
    directives: { hydrateRoundNames: true },
    policyDefinitions: POLICY_ROUND_NAMING_DEFAULT,
  });

  matchUps = tournamentEngine.allTournamentMatchUps({ inContext: false }).matchUps;
  matchUpsWithRoundNames = matchUps.filter((m) => m.roundNumber && m.roundName);
  expect(matchUpsWithRoundNames.length).toEqual(matchUps.length);
});

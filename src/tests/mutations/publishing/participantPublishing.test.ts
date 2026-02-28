import mocksEngine from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { expect, it } from 'vitest';

it('can publish and unpublish participants', () => {
  mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 10 },
    setState: true,
  });

  let result = tournamentEngine.publishParticipants();
  expect(result.success).toEqual(true);

  let publishState = tournamentEngine.getPublishState().publishState;
  expect(publishState.tournament?.participants?.published).toEqual(true);
  expect(publishState.tournament?.status?.published).toEqual(true);

  result = tournamentEngine.unPublishParticipants();
  expect(result.success).toEqual(true);

  publishState = tournamentEngine.getPublishState().publishState;
  expect(publishState.tournament?.status?.published).toEqual(false);
  expect(publishState.tournament?.participants).toBeUndefined();
});

it('can publish participants with columns and language', () => {
  mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 10 },
    setState: true,
  });

  const columns = {
    country: true,
    events: false,
    ratings: ['WTN', 'UTR'],
    rankings: ['SINGLES'],
  };
  const language = 'fr';

  const result = tournamentEngine.publishParticipants({ columns, language });
  expect(result.success).toEqual(true);

  const publishState = tournamentEngine.getPublishState().publishState;
  expect(publishState.tournament?.participants?.published).toEqual(true);
  expect(publishState.tournament?.participants?.columns).toEqual(columns);
  expect(publishState.tournament?.language).toEqual(language);
});

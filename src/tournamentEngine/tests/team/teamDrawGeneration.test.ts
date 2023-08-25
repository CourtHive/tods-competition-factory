import tournamentEngine from '../../sync';
import { expect, it, test } from 'vitest';
import { mocksEngine } from '../../..';

import { tieFormats } from '../../../fixtures/scoring/tieFormats';
import { LAVER_CUP } from '../../../constants/tieFormatConstants';
import { TEAM } from '../../../constants/eventConstants';

test('it can use tieFormatName in addEvent', () => {
  const participantsCount = 8;
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantType: TEAM, participantsCount },
  });

  tournamentEngine.setState(tournamentRecord);

  let result = tournamentEngine.addEvent({
    event: { eventType: TEAM, tieFormatName: LAVER_CUP },
  });

  const { event: eventResult } = result;
  const { eventId } = eventResult;
  expect(result.success).toEqual(true);

  eventResult.tieFormat.collectionDefinitions.forEach(
    (collectionDefinition) => {
      expect(collectionDefinition.collectionId).not.toBeUndefined();
    }
  );

  // must remove the collectionIds to check equality with template
  eventResult.tieFormat.collectionDefinitions.forEach(
    (collectionDefinition) => (collectionDefinition.collectionId = undefined)
  );
  expect(eventResult.tieFormat).toEqual(tieFormats[LAVER_CUP]);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [TEAM] },
    }
  );
  const participantIds = tournamentParticipants.map((p) => p.participantId);
  expect(tournamentParticipants.length).toEqual(participantsCount);

  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);
});

test('it will provide default tieFormat for TEAM events', () => {
  const participantsCount = 8;
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantType: TEAM, participantsCount },
  });

  tournamentEngine.setState(tournamentRecord);

  let result = tournamentEngine.addEvent({ event: { eventType: TEAM } });

  const { event: eventResult } = result;
  const { eventId } = eventResult;
  expect(result.success).toEqual(true);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [TEAM] },
    }
  );
  const participantIds = tournamentParticipants.map((p) => p.participantId);
  expect(tournamentParticipants.length).toEqual(participantsCount);

  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);

  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    eventId,
  });

  expect(drawDefinition.tieFormat).not.toBeUndefined();
  expect(drawDefinition.matchUpType).toEqual(TEAM);
});

it('can generate draws with unique TEAM participants', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 4, eventType: TEAM, uniqueParticipants: true }],
  });

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [TEAM] },
    }
  );
  expect(tournamentParticipants.length).toEqual(8);
});

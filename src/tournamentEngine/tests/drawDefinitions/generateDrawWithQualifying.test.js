import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { it } from 'node:test';

import { INDIVIDUAL } from '../../../constants/participantConstants';
import { expect } from 'vitest';

it('can generateDrawDefinition and place qualifiers', () => {
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 100 },
    eventProfiles: [{ eventName: 'test' }],
  });
  expect(tournamentRecord.participants.length).toEqual(100);

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [INDIVIDUAL] },
    }
  );
  const participantIds = tournamentParticipants.map((p) => p.participantId);
  const mainParticipantIds = participantIds.slice(0, 12);
  const qualifyingParticipantIds = participantIds.slice(12, 28);

  let result = tournamentEngine.addEventEntries({
    participantIds: mainParticipantIds,
    eventId,
  });
  expect(result.success).toEqual(true);
  result = tournamentEngine.addEventEntries({
    participantIds: qualifyingParticipantIds,
    eventId,
  });
  expect(result.success).toEqual(true);

  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    qualifyingProfiles: [
      {
        structureProfiles: [
          { stageSequence: 2, drawSize: 16, qualifyingPositions: 4 },
        ],
      },
    ],
    drawSize: 16,
  });
  expect(drawDefinition);
});

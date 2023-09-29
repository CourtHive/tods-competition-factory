import tournamentEngine from '../../../tournamentEngine/sync';
import { extractAttributes } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import { expect, it } from 'vitest';

import { SEEDING } from '../../../constants/scaleConstants';
import { SINGLES } from '../../../constants/eventConstants';

it('supports manual seeding with alphanumeric values', () => {
  const mockProfile = {
    drawProfiles: [
      {
        generate: false,
        drawSize: 16,
      },
    ],
  };

  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord(mockProfile);
  tournamentEngine.setState(tournamentRecord);

  const event = tournamentEngine.getEvent({ eventId }).event;
  const entriesToSeed = event.entries.slice(0, 4);

  const scaleItemsWithParticipantIds = entriesToSeed.map((entry, index) => ({
    participantId: entry.participantId,
    scaleItems: [
      {
        scaleValue: (index + 1).toString(),
        scaleType: SEEDING,
        eventType: SINGLES,
        scaleName: eventId,
      },
    ],
  }));

  const method = {
    params: { scaleItemsWithParticipantIds },
    method: 'setParticipantScaleItems',
  };

  const result = tournamentEngine.executionQueue([method]);
  expect(result.success).toEqual(true);
  expect(result.results[0].modificationsApplied).toEqual(
    scaleItemsWithParticipantIds.length
  );

  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    seedingScaleName: eventId,
    seedsCount: 4,
    eventId,
  });
  const seedAssignments = drawDefinition.structures[0].seedAssignments;
  expect(seedAssignments.length).toEqual(4);
  const seededParticipantIds = seedAssignments
    .map(extractAttributes('participantId'))
    .filter(Boolean);
  expect(seededParticipantIds.length).toEqual(4);
});

import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, test } from 'vitest';

import { SINGLES_EVENT } from '../../../constants/eventConstants';
import { AD_HOC } from '../../../constants/drawDefinitionConstants';

test('generateDrawDefinition can generate specified number of rounds', () => {
  const participantsCount = 28;
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    eventProfiles: [
      {
        participantsProfile: { participantsCount },
        eventType: SINGLES_EVENT,
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const event = tournamentEngine.getEvent({ eventId }).event;
  expect(event.entries.length).toEqual(participantsCount);

  const drawDefinition = tournamentEngine.generateDrawDefinition({
    drawType: AD_HOC,
    eventId,
  }).drawDefinition;
  expect(drawDefinition.entries.length).toEqual(participantsCount);
});

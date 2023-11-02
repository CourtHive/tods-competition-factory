import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import {
  COURT_NOT_FOUND,
  INVALID_OBJECT,
  MISSING_VALUE,
  NOT_FOUND,
  PARTICIPANT_NOT_FOUND,
  VENUE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

it('supports adding onlineResources', () => {
  const participantsProfile = { participantsCount: 2 };
  const venueProfiles = [
    {
      startTime: '08:00',
      endTime: '20:00',
      courtsCount: 3,
    },
  ];
  const {
    tournamentRecord,
    venueIds: [venueId],
  } = mocksEngine.generateTournamentRecord({
    tournamentName: 'Online Resources',
    participantsProfile,
    venueProfiles,
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

  result = tournamentEngine.addOnlineResource();
  expect(result.error).toEqual(MISSING_VALUE);

  result = tournamentEngine.addOnlineResource({
    onlineResource: { identifier: 'x' },
  });
  expect(result.error).toEqual(INVALID_OBJECT);

  result = tournamentEngine.addOnlineResource({
    onlineResource,
    venueId: 'vid',
  });
  expect(result.error).toEqual(VENUE_NOT_FOUND);

  result = tournamentEngine.addOnlineResource({
    participantId: 'pid',
    onlineResource,
  });
  expect(result.error).toEqual(PARTICIPANT_NOT_FOUND);

  result = tournamentEngine.addOnlineResource({
    personId: 'pid',
    onlineResource,
  });
  expect(result.error).toEqual(NOT_FOUND);

  result = tournamentEngine.addOnlineResource({
    courtId: 'courtId',
    onlineResource,
  });
  expect(result.error).toEqual(COURT_NOT_FOUND);

  result = tournamentEngine.addOnlineResource({
    organisationId: 'organisationId',
    onlineResource,
  });
  expect(result.error).toEqual(NOT_FOUND);

  result = tournamentEngine.addOnlineResource({
    onlineResource,
    venueId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.findVenue({ venueId });
  expect(result.success).toEqual(true);
  expect(result.venue.onlineResources.length).toEqual(1);

  const participantId = tournamentRecord.participants[0].participantId;
  const personId = tournamentRecord.participants[0].person.personId;

  result = tournamentEngine.addOnlineResource({
    onlineResource,
    participantId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.addOnlineResource({
    onlineResource,
    personId,
  });
  expect(result.success).toEqual(true);

  const participant = tournamentEngine.getParticipants({
    participantFilters: { participantIds: [participantId] },
  }).participants[0];
  expect(participant.onlineResources.length).toEqual(1);
  expect(participant.person.onlineResources.length).toEqual(1);
});

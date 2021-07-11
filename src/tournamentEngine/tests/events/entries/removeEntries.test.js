import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../sync';

import { EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT } from '../../../../constants/errorConditionConstants';
import { COMPETITOR } from '../../../../constants/participantRoles';
import { INDIVIDUAL } from '../../../../constants/participantTypes';
import {
  ALTERNATE,
  DIRECT_ACCEPTANCE,
} from '../../../../constants/entryStatusConstants';

test('event entries are only removed when not placed in draw structures', () => {
  const drawProfiles = [{ drawSize: 16 }];
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });
  tournamentEngine.setState(tournamentRecord);

  let participant = {
    participantRole: COMPETITOR,
    participantType: INDIVIDUAL,
    person: {
      standardFamilyName: 'Family',
      standardGivenName: 'Given',
    },
  };

  let result = tournamentEngine.addParticipant({ participant });
  expect(result.success).toEqual(true);
  const participantId = result.participant.participantId;

  result = tournamentEngine.addEventEntries({
    eventId,
    participantIds: [participantId],
  });
  expect(result.success).toEqual(true);

  const { tournamentParticipants } =
    tournamentEngine.getTournamentParticipants();
  const participantIds = tournamentParticipants.map(
    ({ participantId }) => participantId
  );
  expect(participantIds.includes(participantId)).toEqual(true);

  let { event } = tournamentEngine.getEvent({ eventId });
  let { flightProfile } = tournamentEngine.getFlightProfile({ eventId });
  let { drawEntries, drawDefinition } = flightProfile.flights[0];
  expect(drawDefinition.entries.length).toEqual(drawEntries.length);

  // event has an additional entry
  expect(event.entries.length).toEqual(drawEntries.length + 1);

  result = tournamentEngine.removeEventEntries({
    eventId,
    participantIds: [participantId],
  });
  expect(result.success).toEqual(true);

  ({ event } = tournamentEngine.getEvent({ eventId }));
  expect(event.entries.length).toEqual(drawEntries.length);

  const drawEntriesCount = drawEntries.length;

  // now remove an alternate entry that is present in event, flight and drawDefinition
  const alternateParticipantIds = drawEntries
    .filter(({ entryStatus }) => entryStatus === ALTERNATE)
    .map(({ participantId }) => participantId);
  const alternateParticipantId = alternateParticipantIds[0];
  result = tournamentEngine.removeEventEntries({
    participantIds: [alternateParticipantId],
    eventId,
  });
  expect(result.success).toEqual(true);

  // now check the entry is removed from flight and draw entries as well
  ({ flightProfile } = tournamentEngine.getFlightProfile({ eventId }));
  ({ drawEntries, drawDefinition } = flightProfile.flights[0]);
  expect(drawDefinition.entries.length).toEqual(drawEntries.length);

  expect(drawEntries.length).toEqual(drawEntriesCount - 1);

  ({ event } = tournamentEngine.getEvent({ eventId }));
  expect(event.entries.length).toEqual(drawEntries.length);

  const enteredParticipantIds = drawEntries
    .filter(({ entryStatus }) => entryStatus === DIRECT_ACCEPTANCE)
    .map(({ participantId }) => participantId);
  const enteredParticipantId = enteredParticipantIds[0];
  result = tournamentEngine.removeEventEntries({
    participantIds: [enteredParticipantId],
    eventId,
  });
  expect(result.error).toEqual(EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT);
});

import {
  DIRECT_ACCEPTANCE,
  LUCKY_LOSER,
  // DIRECT_ACCEPTANCE,
  WILDCARD,
  WITHDRAWN,
} from '../../../../constants/entryStatusConstants';
import mocksEngine from '../../../../mocksEngine';
import { intersection, unique } from '../../../../utilities';
import tournamentEngine from '../../../sync';

it('can modify entryStatus within event.entries', () => {
  const drawProfiles = [
    {
      drawSize: 8,
    },
  ];
  const participantsProfile = {
    participantsCount: 16,
  };
  const {
    eventIds: [eventId],
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });

  const {
    tournamentParticipants,
  } = tournamentEngine.getTournamentParticipants();
  const participantIds = tournamentParticipants.map((p) => p.participantId);

  let result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);

  let { event, drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { structureId } = drawDefinition.structures[0];
  const { positionAssignments } = tournamentEngine.getPositionAssignments({
    drawId,
    structureId,
  });
  const assignedParticipantIds = positionAssignments.map(
    ({ participantId }) => participantId
  );
  const unassignedParticipantIds = participantIds.filter(
    (participantId) => !assignedParticipantIds.includes(participantId)
  );

  result = tournamentEngine.modifyEntriesStatus({
    eventId,
    participantIds: unassignedParticipantIds,
    entryStatus: WITHDRAWN,
  });
  expect(result.success).toEqual(true);

  // expect that participants assigned positions cannot be withdrawn
  result = tournamentEngine.modifyEntriesStatus({
    eventId,
    participantIds: assignedParticipantIds,
    entryStatus: WITHDRAWN,
  });
  expect(result.error).not.toBeUndefined();

  // when passing eventId and NOT drawId only the event.entries are mofidied
  result = tournamentEngine.modifyEntriesStatus({
    eventId,
    participantIds: assignedParticipantIds,
    entryStatus: WILDCARD,
  });
  expect(result.success).toEqual(true);

  ({ event, drawDefinition } = tournamentEngine.getEvent({ drawId }));
  let eventEntries = event.entries;
  let drawEntries = drawDefinition.entries;
  let { flightProfile } = tournamentEngine.getFlightProfile({ eventId });
  let flightEntries = flightProfile.flights.find(
    (flight) => flight.drawId === drawId
  )?.drawEntries;

  let eventEntryStatuses = unique(
    eventEntries.map(({ entryStatus }) => entryStatus)
  );
  let drawEntryStatuses = unique(
    drawEntries.map(({ entryStatus }) => entryStatus)
  );
  let flightEntryStatuses = unique(
    flightEntries.map(({ entryStatus }) => entryStatus)
  );

  expect(
    intersection(eventEntryStatuses, [WILDCARD, WITHDRAWN]).length
  ).toEqual(2);
  expect(
    intersection(drawEntryStatuses, [DIRECT_ACCEPTANCE, WITHDRAWN]).length
  ).toEqual(2);
  expect(
    intersection(flightEntryStatuses, [DIRECT_ACCEPTANCE, WITHDRAWN]).length
  ).toEqual(2);

  // when passing BOTH drawId, BOTH drawDefinition.entries and flight.drawEntries are mofidied,
  // ...but event.entries are unchanged...
  result = tournamentEngine.modifyEntriesStatus({
    drawId,
    eventId,
    participantIds: assignedParticipantIds,
    entryStatus: LUCKY_LOSER,
  });
  expect(result.success).toEqual(true);

  ({ event, drawDefinition } = tournamentEngine.getEvent({ drawId }));
  eventEntries = event.entries;
  drawEntries = drawDefinition.entries;
  ({ flightProfile } = tournamentEngine.getFlightProfile({ eventId }));
  flightEntries = flightProfile.flights.find(
    (flight) => flight.drawId === drawId
  )?.drawEntries;

  eventEntryStatuses = unique(
    eventEntries.map(({ entryStatus }) => entryStatus)
  );
  drawEntryStatuses = unique(drawEntries.map(({ entryStatus }) => entryStatus));
  flightEntryStatuses = unique(
    flightEntries.map(({ entryStatus }) => entryStatus)
  );

  expect(
    intersection(eventEntryStatuses, [WILDCARD, WITHDRAWN]).length
  ).toEqual(2);
  expect(
    intersection(drawEntryStatuses, [LUCKY_LOSER, WITHDRAWN]).length
  ).toEqual(2);
  expect(
    intersection(flightEntryStatuses, [LUCKY_LOSER, WITHDRAWN]).length
  ).toEqual(2);
});

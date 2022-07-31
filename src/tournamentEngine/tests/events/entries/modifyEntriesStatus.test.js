import { instanceCount, intersection, unique } from '../../../../utilities';
import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../sync';
import {
  getEntryStatus,
  getParticipantId,
  getParticipantIds,
} from '../../../../global/functions/extractors';

import { INDIVIDUAL, PAIR } from '../../../../constants/participantConstants';
import { COMPETITOR } from '../../../../constants/participantRoles';
import {
  ENTRY_STATUS_NOT_ALLOWED_FOR_EVENT,
  EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
  INVALID_ENTRY_STATUS,
  INVALID_VALUES,
} from '../../../../constants/errorConditionConstants';
import {
  ALTERNATE,
  CONFIRMED,
  DIRECT_ACCEPTANCE,
  LUCKY_LOSER,
  ORGANISER_ACCEPTANCE,
  WITHDRAWN,
} from '../../../../constants/entryStatusConstants';

it('can modify entryStatus within event.entries', () => {
  const drawProfiles = [{ drawSize: 8, alternatesCount: 2 }];
  const participantsProfile = {
    participantsCount: 16,
  };
  const {
    eventIds: [eventId],
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    participantsProfile,
    drawProfiles,
  });

  const { tournamentParticipants } = tournamentEngine
    .setState(tournamentRecord)
    .getTournamentParticipants();
  const participantIds = getParticipantIds(tournamentParticipants);

  let result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);

  let { event, drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { structureId } = drawDefinition.structures[0];
  const { positionAssignments } = tournamentEngine.getPositionAssignments({
    structureId,
    drawId,
  });
  const assignedParticipantIds = positionAssignments.map(getParticipantId);
  const unassignedParticipantIds = participantIds.filter(
    (participantId) => !assignedParticipantIds.includes(participantId)
  );

  result = tournamentEngine.modifyEntriesStatus({
    participantIds: unassignedParticipantIds,
    entryStatus: WITHDRAWN,
    eventId,
  });
  expect(result.success).toEqual(true);

  // expect that participants assigned positions cannot be withdrawn
  result = tournamentEngine.modifyEntriesStatus({
    participantIds: assignedParticipantIds,
    entryStatus: WITHDRAWN,
    eventId,
  });
  expect(result.error).toEqual(EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT);

  // when passing eventId and NOT drawId only the event.entries are mofidied
  result = tournamentEngine.modifyEntriesStatus({
    participantIds: assignedParticipantIds,
    entryStatus: CONFIRMED,
    eventId,
  });
  expect(result.success).toEqual(true);

  ({ event, drawDefinition } = tournamentEngine.getEvent({ drawId }));
  let eventEntries = event.entries;
  let drawEntries = drawDefinition.entries;
  let { flightProfile } = tournamentEngine.getFlightProfile({ eventId });
  let flightEntries = flightProfile.flights.find(
    (flight) => flight.drawId === drawId
  )?.drawEntries;

  let eventEntryStatuses = unique(eventEntries.map(getEntryStatus));
  let drawEntryStatuses = unique(drawEntries.map(getEntryStatus));
  let flightEntryStatuses = unique(flightEntries.map(getEntryStatus));

  expect(
    intersection(eventEntryStatuses, [CONFIRMED, WITHDRAWN]).length
  ).toEqual(2);
  expect(drawEntryStatuses).toEqual([DIRECT_ACCEPTANCE]);
  expect(flightEntryStatuses).toEqual([DIRECT_ACCEPTANCE]);

  // when passing BOTH drawId, BOTH drawDefinition.entries and flight.drawEntries are mofidied,
  // ...but event.entries are unchanged...
  result = tournamentEngine.modifyEntriesStatus({
    participantIds: assignedParticipantIds,
    entryStatus: ORGANISER_ACCEPTANCE,
    eventId,
    drawId,
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
    intersection(eventEntryStatuses, [CONFIRMED, WITHDRAWN]).length
  ).toEqual(2);
  expect(drawEntryStatuses).toEqual([ORGANISER_ACCEPTANCE]);
  expect(flightEntryStatuses).toEqual([ORGANISER_ACCEPTANCE]);
});

it('can add and remove extensions from entries', () => {
  const drawProfiles = [{ drawSize: 8, alternatesCount: 2 }];
  const participantsProfile = {
    participantsCount: 16,
  };

  let {
    eventIds: [eventId],
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    participantsProfile,
    drawProfiles,
  });

  const { tournamentParticipants } = tournamentEngine
    .setState(tournamentRecord)
    .getTournamentParticipants();
  const participantIds = getParticipantIds(tournamentParticipants);

  let result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);

  let { event, drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { structureId } = drawDefinition.structures[0];
  const { positionAssignments } = tournamentEngine.getPositionAssignments({
    structureId,
    drawId,
  });
  const assignedParticipantIds = positionAssignments.map(getParticipantId);
  const unassignedParticipantIds = participantIds.filter(
    (participantId) => !assignedParticipantIds.includes(participantId)
  );

  result = tournamentEngine.modifyEntriesStatus({
    participantIds: unassignedParticipantIds,
    extension: { name: 'statusDetail', value: 'available' },
    eventId,
  });
  expect(result.success).toEqual(true);

  ({ event, drawDefinition } = tournamentEngine.getEvent({ drawId }));

  let entriesWithExtensions = event.entries.filter(
    ({ extensions }) => extensions && extensions.length
  );
  expect(entriesWithExtensions.length).toEqual(unassignedParticipantIds.length);

  result = tournamentEngine.modifyEntriesStatus({
    participantIds: unassignedParticipantIds,
    extension: { name: 'statusDetail', value: undefined },
    eventId,
  });
  expect(result.success).toEqual(true);

  ({ event, drawDefinition } = tournamentEngine.getEvent({ drawId }));
  entriesWithExtensions = event.entries.filter(
    ({ extensions }) => extensions && extensions.length
  );
  expect(entriesWithExtensions.length).toEqual(0);

  result = tournamentEngine.modifyEntriesStatus({
    participantIds: unassignedParticipantIds,
    extension: { name: 'statusDetail', invalidAttribute: 'invalid' },
    eventId,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = tournamentEngine.modifyEntriesStatus({
    extension: { name: 'statusDetail', value: 'available' },
    participantIds: unassignedParticipantIds,
    entryStatus: DIRECT_ACCEPTANCE,
    eventId,
  });
  expect(result.success).toEqual(true);

  ({ event, drawDefinition } = tournamentEngine.getEvent({ drawId }));
  entriesWithExtensions = event.entries.filter(
    ({ extensions }) => extensions && extensions.length
  );
  expect(entriesWithExtensions.length).toEqual(8);
});

it('can account for individuals appearing in multiple doubles pairs', () => {
  const eventProfiles = [
    {
      eventId: 'eId',
      eventType: 'DOUBLES',
      drawProfiles: [
        {
          drawSize: 4,
          idPrefix: 'a',
          generate: false,
          uniqueParticipants: true,
        },
        { drawSize: 4, idPrefix: 'b', generate: false },
      ],
    },
  ];
  const {
    drawIds,
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    eventProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants: individualParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
    });
  const { tournamentParticipants: pairParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [PAIR] },
    });
  expect(individualParticipants.length).toEqual(16);
  expect(pairParticipants.length).toEqual(8);

  expect(tournamentRecord.events[0].drawDefinitions).toBeUndefined();

  let { flightProfile } = tournamentEngine.getFlightProfile({ eventId });

  // create some new particpants by combining individuals from each flight
  const crossParticipants = [0, 1, 2, 3]
    .map((index) =>
      flightProfile.flights.map(({ drawEntries }) => {
        const pairParticipantId = drawEntries[index].participantId;
        return pairParticipants.find(
          ({ participantId }) => participantId === pairParticipantId
        ).individualParticipantIds[0];
      })
    )
    .map((individualParticipantIds) => ({
      participantType: PAIR,
      participantRole: COMPETITOR,
      individualParticipantIds,
    }));

  let result = tournamentEngine.addParticipants({
    participants: crossParticipants,
    returnParticipants: true,
  });
  expect(result.success).toEqual(true);
  const newPairParticipants = result.participants;
  expect(newPairParticipants.length).toEqual(4);

  // add crossParticipants/newPairParticipants to each flight (via drawId)
  for (const index of [0, 1]) {
    const pairParticipants = newPairParticipants.slice(
      index * 2,
      index * 2 + 2
    );
    const participantIds = pairParticipants.map(getParticipantId);
    const result = tournamentEngine.addEventEntries({
      drawId: drawIds[index],
      participantIds,
      eventId,
    });
    expect(result.success).toEqual(true);
  }

  ({ flightProfile } = tournamentEngine.getFlightProfile({ eventId }));

  // generate the first of the two flights
  let [firstFlight, secondFlight] = flightProfile.flights;
  const { drawDefinition, success } = tournamentEngine.generateDrawDefinition({
    ...firstFlight,
    eventId,
  });
  expect(success).toEqual(true);
  expect(drawDefinition).not.toBeUndefined();

  result = tournamentEngine.addDrawDefinition({
    flight: firstFlight,
    drawDefinition,
    eventId,
  });
  expect(result.success).toEqual(true);

  const firstFlightParticipantIds = getParticipantIds(firstFlight.drawEntries);
  result = tournamentEngine.modifyEntriesStatus({
    participantIds: firstFlightParticipantIds,
    entryStatus: ALTERNATE,
    eventId,
  });
  expect(result.error).toEqual(EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT);

  const secondFlightParticipantIds = getParticipantIds(
    secondFlight.drawEntries
  );
  result = tournamentEngine.modifyEntriesStatus({
    participantIds: secondFlightParticipantIds,
    entryStatus: ALTERNATE,
    eventId,
  });
  expect(result.success).toEqual(true);

  ({ flightProfile } = tournamentEngine.getFlightProfile({ eventId }));
  [firstFlight, secondFlight] = flightProfile.flights;

  expect(unique(firstFlight.drawEntries.map(getEntryStatus))).toEqual([
    DIRECT_ACCEPTANCE,
  ]);
  expect(unique(secondFlight.drawEntries.map(getEntryStatus))).toEqual([
    ALTERNATE,
  ]);

  const { event } = tournamentEngine.getEvent({ eventId });
  expect(instanceCount(event.entries.map(getEntryStatus))).toEqual({
    DIRECT_ACCEPTANCE: 6,
    ALTERNATE: 6,
  });

  result = tournamentEngine.modifyEntriesStatus({
    participantIds: firstFlightParticipantIds,
    entryStatus: WITHDRAWN,
    eventId,
  });
  expect(result.error).toEqual(EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT);

  result = tournamentEngine.modifyEntriesStatus({
    participantIds: secondFlightParticipantIds,
    entryStatus: WITHDRAWN,
    eventId,
  });
  expect(result.success).toEqual(true);

  ({ flightProfile } = tournamentEngine.getFlightProfile({ eventId }));
  [firstFlight, secondFlight] = flightProfile.flights;

  expect(firstFlight.drawEntries.length).toEqual(6);
  expect(secondFlight.drawEntries.length).toEqual(0);
});

it('will not allow event.entries to have entryStatus appropriate only for draws', () => {
  const eventProfiles = [
    {
      eventId: 'eId',
      drawProfiles: [
        {
          drawSize: 4,
          idPrefix: 'a',
          generate: false,
        },
      ],
    },
  ];
  const {
    drawIds: [drawId],
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    eventProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  let {
    flightProfile: {
      flights: [flight],
    },
  } = tournamentEngine.getFlightProfile({ eventId });
  const participantIds = getParticipantIds(flight.drawEntries);

  let result = tournamentEngine.modifyEntriesStatus({
    entryStatus: LUCKY_LOSER,
    participantIds,
    eventId,
    drawId,
  });
  expect(result.success).toEqual(true);

  let { event } = tournamentEngine.getEvent({ eventId });
  expect(unique(event.entries.map(getEntryStatus))).toEqual([
    DIRECT_ACCEPTANCE,
  ]);

  ({
    flightProfile: {
      flights: [flight],
    },
  } = tournamentEngine.getFlightProfile({ eventId }));
  expect(unique(flight.drawEntries.map(getEntryStatus))).toEqual([LUCKY_LOSER]);

  result = tournamentEngine.modifyEntriesStatus({
    entryStatus: 'invalidStatus',
    participantIds,
    eventId,
  });
  expect(result.error).toEqual(INVALID_ENTRY_STATUS);

  result = tournamentEngine.modifyEntriesStatus({
    entryStatus: LUCKY_LOSER,
    participantIds,
    eventId,
  });
  expect(result.error).toEqual(ENTRY_STATUS_NOT_ALLOWED_FOR_EVENT);

  ({ event } = tournamentEngine.getEvent({ eventId }));
  expect(unique(event.entries.map(getEntryStatus))).toEqual([
    DIRECT_ACCEPTANCE,
  ]);
});

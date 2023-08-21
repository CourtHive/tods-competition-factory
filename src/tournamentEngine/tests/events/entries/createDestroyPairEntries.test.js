import { isUngrouped } from '../../../../global/functions/isUngrouped';
import { chunkArray } from '../../../../utilities';
import mocksEngine from '../../../../mocksEngine';
import { tournamentEngine } from '../../../sync';
import { expect, it } from 'vitest';

import { DOUBLES, SINGLES, TEAM } from '../../../../constants/eventConstants';
import { INDIVIDUAL, PAIR } from '../../../../constants/participantConstants';
import { FORMAT_STANDARD } from '../../../../fixtures/scoring/matchUpFormats';
import { QUALIFYING } from '../../../../constants/drawDefinitionConstants';
import { ALTERNATE } from '../../../../constants/entryStatusConstants';
import { COMPETITOR } from '../../../../constants/participantRoles';
import {
  INVALID_EVENT_TYPE,
  INVALID_PARTICIPANT_IDS,
  INVALID_PARTICIPANT_TYPE,
  MISSING_EVENT,
  MISSING_PARTICIPANT_ID,
  PARTICIPANT_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';

const startDate = '2020-01-01';
const endDate = '2020-01-06';
let result;

it('can add doubles events to a tournament record', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantType: PAIR, participantsCount: 32 },
    startDate,
    endDate,
  });
  const { participants } = tournamentRecord;

  tournamentEngine.setState(tournamentRecord);

  const eventName = 'Test Event';
  const event = {
    eventName,
    eventType: DOUBLES,
  };

  result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const participantIds = participants
    .filter((participant) => participant.participantType === PAIR)
    .map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);

  const matchUpFormat = 'SET5-S:4/TB7';
  const values = {
    automated: true,
    drawSize: 32,
    eventId,
    event: eventResult,
    matchUpFormat,
  };
  const { drawDefinition } = tournamentEngine.generateDrawDefinition(values);
  expect(drawDefinition.matchUpFormat).toEqual(matchUpFormat);

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result.success).toEqual(true);

  const { drawId } = drawDefinition;
  const defaultMatchUpFormat = FORMAT_STANDARD;
  result = tournamentEngine.setMatchUpFormat({
    matchUpFormat: defaultMatchUpFormat,
    drawId,
  });
  expect(result.success).toEqual(true);

  const { tournamentRecord: updatedTournamentRecord } =
    tournamentEngine.getState();
  expect(
    updatedTournamentRecord.events[0].drawDefinitions[0].matchUpFormat
  ).toEqual(defaultMatchUpFormat);

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants();
  expect(tournamentParticipants.length).toEqual(96);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
  }));
  expect(tournamentParticipants.length).toEqual(64);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [PAIR] },
  }));
  expect(tournamentParticipants.length).toEqual(32);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { eventIds: [eventId] },
  }));
  expect(tournamentParticipants.length).toEqual(96);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantRoles: [COMPETITOR] },
  }));
  expect(tournamentParticipants.length).toEqual(96);

  const individualParticipants = tournamentParticipants.filter(
    (participant) => participant.participantType === INDIVIDUAL
  );
  const individualParticipant = individualParticipants[0];
  const { participantId } = individualParticipant;

  const { eventDetails } = tournamentEngine.getParticipantEventDetails({
    participantId,
  });

  expect(eventDetails.length).toEqual(1);
  expect(eventDetails[0].eventName).toEqual(eventName);
});

it('can destroy pair entries in doubles events', () => {
  const singlesId = 'singlesId';
  const doublesId = 'doublesId';
  const teamId = 'teamId';
  const { eventIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantType: PAIR, participantsCount: 32 },
    eventProfiles: [
      { eventType: SINGLES, eventId: singlesId },
      { eventType: DOUBLES, eventId: doublesId },
      { eventType: TEAM, eventId: teamId },
    ],
    startDate,
    endDate,
  });
  const { participants } = tournamentRecord;
  expect(eventIds).toEqual([singlesId, doublesId, teamId]);

  tournamentEngine.setState(tournamentRecord);

  const pairParticipantIds = participants
    .filter((participant) => participant.participantType === PAIR)
    .map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({
    participantIds: pairParticipantIds,
    eventId: doublesId,
  });
  expect(result.success).toEqual(true);

  let { event: updatedEvent } = tournamentEngine.getEvent({
    eventId: doublesId,
  });
  expect(updatedEvent.entries.length).toEqual(32);

  const pairParticipantId = updatedEvent.entries[0].participantId;
  result = tournamentEngine.destroyPairEntry({
    eventId: doublesId,
  });
  expect(result.error).toEqual(MISSING_PARTICIPANT_ID);

  result = tournamentEngine.destroyPairEntry({
    participantId: pairParticipantId,
  });
  expect(result.error).toEqual(MISSING_EVENT);

  result = tournamentEngine.destroyPairEntry({
    participantId: 'invalidParticipantId',
    eventId: doublesId,
  });
  expect(result.error).toEqual(PARTICIPANT_NOT_FOUND);

  result = tournamentEngine.destroyPairEntry({
    participantId: pairParticipantId,
    eventId: teamId,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_TYPE);

  result = tournamentEngine.destroyPairEntry({
    participantId: pairParticipantId,
    eventId: doublesId,
  });
  expect(result.success).toEqual(true);

  ({ event: updatedEvent } = tournamentEngine.getEvent({
    eventId: doublesId,
  }));
  expect(updatedEvent.entries.length).toEqual(33);

  const unpairedEntries = updatedEvent.entries.filter((entry) =>
    isUngrouped(entry.entryStatus)
  );
  expect(unpairedEntries.length).toEqual(2);
  const individualParticipantIds = unpairedEntries.map(
    (entry) => entry.participantId
  );

  const participant = {
    participantType: PAIR,
    participantRole: COMPETITOR,
    individualParticipantIds,
  };

  result = tournamentEngine.addParticipant({ participant });
  expect(result.success).toEqual(true);

  result = tournamentEngine.getPairedParticipant({
    participantIds: individualParticipantIds,
  });
  expect(result.participant.participantId).toEqual(pairParticipantId);

  result = tournamentEngine.addEventEntries({
    participantIds: [pairParticipantId],
    eventId: doublesId,
  });
  expect(result.success).toEqual(true);

  ({ event: updatedEvent } = tournamentEngine.getEvent({
    eventId: doublesId,
  }));
  expect(updatedEvent.entries.length).toEqual(32);

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants();
  let participantIds = tournamentParticipants.map(
    ({ participantId }) => participantId
  );
  const participantsCount = participantIds.length;

  result = tournamentEngine.destroyPairEntry({
    participantId: pairParticipantId,
    removeGroupParticipant: true,
    eventId: doublesId,
  });
  expect(result.success).toEqual(true);
  expect(result.participantRemoved).toEqual(true);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants());
  participantIds = tournamentParticipants.map(
    ({ participantId }) => participantId
  );
  expect(participantIds.length).toEqual(participantsCount - 1);
});

it('can create pair entries in doubles events', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    eventProfiles: [
      { eventType: DOUBLES, eventId: 'firstDoublesId' },
      {
        eventType: DOUBLES,
        eventId: 'secondDoublesId',
        drawProfiles: [{ drawSize: 4, uniqueParticipants: true }],
      },
      {
        eventType: SINGLES,
        eventId: 'singlesId',
        drawProfiles: [{ drawSize: 32, uniqueParticipants: true }],
      },
    ],
    startDate,
    endDate,
  });
  tournamentEngine.setState(tournamentRecord);
  const eventId = 'firstDoublesId';

  const { tournamentParticipants: individualParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
    });

  const { tournamentParticipants: pairParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [PAIR] },
    });

  const individualParticipantIdsInPairs = pairParticipants
    .map(({ individualParticipantIds }) => individualParticipantIds)
    .flat();

  const unpairedIndividualParticipants = individualParticipants.filter(
    ({ participantId }) =>
      !individualParticipantIdsInPairs.includes(participantId)
  );

  const invalidParticipantIdPairs = chunkArray(
    pairParticipants.map((participant) => participant.participantId),
    2
  );

  const participantIdPairs = chunkArray(
    unpairedIndividualParticipants.map(
      (participant) => participant.participantId
    ),
    2
  );

  result = tournamentEngine.addEventEntryPairs({
    entryStatus: ALTERNATE,
    entryStage: QUALIFYING,
    participantIdPairs,
  });
  expect(result.error).toEqual(MISSING_EVENT);

  result = tournamentEngine.addEventEntryPairs({
    entryStatus: ALTERNATE,
    entryStage: QUALIFYING,
    eventId: 'singlesId',
    participantIdPairs,
  });
  expect(result.error).toEqual(INVALID_EVENT_TYPE);

  result = tournamentEngine.addEventEntryPairs({
    participantIdPairs: invalidParticipantIdPairs,
    entryStatus: ALTERNATE,
    entryStage: QUALIFYING,
    eventId,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_IDS);

  result = tournamentEngine.addEventEntryPairs({
    participantIdPairs: unpairedIndividualParticipants,
    entryStatus: ALTERNATE,
    entryStage: QUALIFYING,
    eventId,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_IDS);

  result = tournamentEngine.addEventEntryPairs({
    entryStatus: ALTERNATE,
    entryStage: QUALIFYING,
    participantIdPairs,
    eventId,
  });
  expect(result.success).toEqual(true);
  expect(result.newParticipantIds.length).toEqual(16);

  result = tournamentEngine.addEventEntryPairs({
    entryStatus: ALTERNATE,
    entryStage: QUALIFYING,
    participantIdPairs,
    eventId,
  });
  expect(result.success).toEqual(true);
  expect(result.info).not.toBeUndefined();
  expect(result.newParticipantIds.length).toEqual(0);

  const { event: updatedEvent } = tournamentEngine.getEvent({ eventId });

  expect(updatedEvent.entries.length).toEqual(16);

  updatedEvent.entries.forEach((entry) => {
    expect(entry.entryStage).toEqual(QUALIFYING);
    expect(entry.entryStatus).toEqual(ALTERNATE);
  });
});

it('can allow duplicateParticipantIdsPairs and add them to events', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantType: PAIR, participantsCount: 32 },
    startDate,
    endDate,
  });

  tournamentEngine.setState(tournamentRecord);

  const eventName = 'Test Event';
  const event = {
    eventType: DOUBLES,
    eventName,
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  let { tournamentParticipants: pairPairticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [PAIR] },
    });
  expect(pairPairticipants.length).toEqual(32);

  const pairParticipantToDuplicate = pairPairticipants.pop();
  const participantIds = pairPairticipants.map(
    ({ participantId }) => participantId
  );
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);

  let { event: updatedEvent } = tournamentEngine.getEvent({ eventId });
  expect(updatedEvent.entries.length).toEqual(31);

  const participantIdPairs = [
    pairParticipantToDuplicate.individualParticipantIds,
  ];
  result = tournamentEngine.addEventEntryPairs({
    allowDuplicateParticipantIdPairs: true,
    participantIdPairs,
    eventId,
  });
  expect(result.success).toEqual(true);

  ({ event: updatedEvent } = tournamentEngine.getEvent({ eventId }));
  expect(updatedEvent.entries.length).toEqual(32);

  ({ tournamentParticipants: pairPairticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [PAIR] },
    }));
  expect(pairPairticipants.length).toEqual(33);

  const { duplicatedPairParticipants } = tournamentEngine.getPairedParticipant({
    participantIds: pairParticipantToDuplicate.individualParticipantIds,
  });
  expect(duplicatedPairParticipants.length).toEqual(1);
  const duplicatedPairParticipantIds = duplicatedPairParticipants.map(
    ({ participantId }) => participantId
  );
  const newPairParticipantId = duplicatedPairParticipantIds.find(
    (participantId) =>
      participantId !== pairParticipantToDuplicate.participantId
  );

  const {
    event: { entries },
  } = tournamentEngine.getEvent({ eventId });
  const enteredParticipantIds = entries.map(
    ({ participantId }) => participantId
  );
  expect(
    enteredParticipantIds.includes(pairParticipantToDuplicate.participantId)
  ).toEqual(false);
  expect(enteredParticipantIds.includes(newPairParticipantId)).toEqual(true);
});

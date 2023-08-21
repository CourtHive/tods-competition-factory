import { chunkArray, unique } from '../../../../utilities';
import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../sync';
import { expect, it } from 'vitest';

import {
  DOUBLES_EVENT,
  SINGLES_EVENT,
} from '../../../../constants/eventConstants';
import { INDIVIDUAL, PAIR } from '../../../../constants/participantConstants';
import {
  INVALID_PARTICIPANT_IDS,
  MISSING_EVENT,
} from '../../../../constants/errorConditionConstants';
import { ALTERNATE } from '../../../../constants/entryStatusConstants';
import { QUALIFYING } from '../../../../constants/drawDefinitionConstants';

it('can modify entries for a DOUBLES event and create PAIR participants', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 32 },
  });
  let { tournamentParticipants } = tournamentEngine
    .setState(tournamentRecord)
    .getTournamentParticipants();

  let participantTypes = unique(
    tournamentParticipants.map(({ participantType }) => participantType)
  );
  expect(participantTypes).toEqual([INDIVIDUAL]);

  const participantIds = tournamentParticipants.map(
    ({ participantId }) => participantId
  );
  expect(participantIds.length).toEqual(32);
  const participantIdPairs = chunkArray(participantIds, 2);

  const eventName = 'Test Event';
  const event = {
    eventType: DOUBLES_EVENT,
    eventName,
  };

  let result = tournamentEngine.addEvent({ event });
  expect(result.success).toEqual(true);
  const { eventId } = result.event;

  result = tournamentEngine.modifyEventEntries({ participantIdPairs });
  expect(result.error).toEqual(MISSING_EVENT);

  result = tournamentEngine.modifyEventEntries({
    participantIdPairs: ['invalid'],
    eventId,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_IDS);

  result = tournamentEngine.modifyEventEntries({ eventId, participantIdPairs });
  expect(result.success).toEqual(true);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants());
  participantTypes = unique(
    tournamentParticipants.map(({ participantType }) => participantType)
  );

  // modifyEventEntries has automatically created PAIR participants
  expect(participantTypes).toEqual([INDIVIDUAL, PAIR]);
});

it('will not allow duplicated entries to be created', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  const { participants } = tournamentRecord;

  tournamentEngine.setState(tournamentRecord);

  const eventName = 'Test Event';
  const event = {
    eventType: SINGLES_EVENT,
    eventName,
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.addedEntriesCount).toEqual(0);
  expect(result.success).toEqual(true);
  result = tournamentEngine.addEventEntries({
    entryStatus: ALTERNATE,
    participantIds,
    eventId,
  });
  expect(result.addedEntriesCount).toEqual(0);
  expect(result.success).toEqual(true);
  result = tournamentEngine.addEventEntries({
    entryStatus: ALTERNATE,
    entryStage: QUALIFYING,
    participantIds,
    eventId,
  });
  expect(result.addedEntriesCount).toEqual(0);
  expect(result.success).toEqual(true);
});

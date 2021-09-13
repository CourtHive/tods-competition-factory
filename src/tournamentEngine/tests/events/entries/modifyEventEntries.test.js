import { chunkArray, unique } from '../../../../utilities';
import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../sync';

import {
  INVALID_PARTICIPANT_IDS,
  MISSING_EVENT,
} from '../../../../constants/errorConditionConstants';
import { INDIVIDUAL, PAIR } from '../../../../constants/participantTypes';
import { DOUBLES } from '../../../../constants/eventConstants';

it('can modify entries for a DOUBLES event and create PAIR participants', () => {
  const participantsProfile = {
    participantsCount: 32,
  };
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile,
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
    eventName,
    eventType: DOUBLES,
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

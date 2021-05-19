import mocksEngine from '../../../../mocksEngine';
import { chunkArray, unique } from '../../../../utilities';
import tournamentEngine from '../../../sync';

import { DOUBLES } from '../../../../constants/eventConstants';
import { INDIVIDUAL, PAIR } from '../../../../constants/participantTypes';

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

  result = tournamentEngine.modifyEventEntries({ eventId, participantIdPairs });
  expect(result.success).toEqual(true);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants());
  participantTypes = unique(
    tournamentParticipants.map(({ participantType }) => participantType)
  );

  // modifyEventEntries has automatically created PAIR participants
  expect(participantTypes).toEqual([INDIVIDUAL, PAIR]);
});

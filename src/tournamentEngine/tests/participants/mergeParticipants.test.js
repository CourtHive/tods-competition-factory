import { setSubscriptions } from '../../../global/globalState';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import {
  ADD_PARTICIPANTS,
  MODIFY_PARTICIPANTS,
} from '../../../constants/topicConstants';

test('participants can be merged', () => {
  let participantAddEventsCounter = 0;
  let participantModifyEventsCounter = 0;
  setSubscriptions({
    subscriptions: {
      [ADD_PARTICIPANTS]: (addedParticipants) => {
        participantAddEventsCounter += addedParticipants?.length || 0;
      },
      [MODIFY_PARTICIPANTS]: (participants) => {
        participantModifyEventsCounter += participants?.length || 0;
      },
    },
  });
  let { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 10 },
  });

  tournamentEngine.setState(tournamentRecord);

  const modifiedParticipant = tournamentRecord.participants[0];
  modifiedParticipant.person.previousNames = ['Previous Name'];
  const { participantId } = modifiedParticipant;

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantIds: [participantId] },
  });

  expect(modifiedParticipant.person).not.toEqual(
    tournamentParticipants[0].person
  );

  let result = tournamentEngine.mergeParticipants({
    participants: [modifiedParticipant],
  });
  expect(result.success).toEqual(true);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantIds: [participantId] },
  }));
  expect(modifiedParticipant.person).toEqual(tournamentParticipants[0].person);

  modifiedParticipant.person.previousNames = ['Previous Name', 'Another Name'];

  result = tournamentEngine.mergeParticipants({
    participants: [modifiedParticipant],
  });
  expect(result.success).toEqual(true);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantIds: [participantId] },
  }));
  expect(modifiedParticipant.person).toEqual(tournamentParticipants[0].person);

  modifiedParticipant.person.previousNames = ['New Previous Name'];

  result = tournamentEngine.mergeParticipants({
    participants: [modifiedParticipant],
    arraysToMerge: ['previousNames'],
  });
  expect(result.success).toEqual(true);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantIds: [participantId] },
  }));
  expect(tournamentParticipants[0].person.previousNames.length).toEqual(3);

  const { participants } = mocksEngine.generateParticipants({
    participantsCount: 10,
  });

  result = tournamentEngine.mergeParticipants({
    participants,
    arraysToMerge: ['previousNames'],
  });
  expect(result.success).toEqual(true);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants());
  expect(tournamentParticipants.length).toEqual(20);

  result = tournamentEngine.newTournamentRecord();
  expect(result.success).toEqual(true);

  tournamentRecord = tournamentEngine.getState();

  result = tournamentEngine.mergeParticipants({ participants });
  expect(result.success).toEqual(true);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants());
  expect(tournamentParticipants.length).toEqual(10);

  expect(participantAddEventsCounter).toEqual(3);
  expect(participantModifyEventsCounter).toEqual(3);
});

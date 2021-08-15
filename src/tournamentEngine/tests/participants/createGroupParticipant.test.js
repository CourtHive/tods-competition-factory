import tournamentEngine from '../../sync';
import mocksEngine from '../../../mocksEngine';
import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';

import { GROUP, INDIVIDUAL } from '../../../constants/participantTypes';
import { setSubscriptions } from '../../../global/globalState';
import { ADD_PARTICIPANTS } from '../../../constants/topicConstants';

it('can create group participants', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();

  let participantAddCounter = 0;
  let result = setSubscriptions({
    subscriptions: {
      [ADD_PARTICIPANTS]: () => {
        participantAddCounter += 1;
      },
    },
  });
  expect(result.success).toEqual(true);

  tournamentEngine.setState(tournamentRecord);
  const { tournamentParticipants: individualParticipants } =
    getTournamentParticipants({
      tournamentRecord,
      participantFilters: { participantTypes: [INDIVIDUAL] },
    });

  const [participant1, participant2] = individualParticipants;

  const individualParticipantIds = [
    participant1.participantId,
    participant2.participantId,
  ];
  result = tournamentEngine.createGroupParticipant({
    individualParticipantIds,
  });
  expect(result.error).not.toBeUndefined();

  const groupName = 'Group Name';
  result = tournamentEngine.createGroupParticipant({
    individualParticipantIds: 'not an array',
    groupName,
  });
  expect(result.error).not.toBeUndefined();

  result = tournamentEngine.createGroupParticipant({
    individualParticipantIds: ['bogusId'],
    groupName,
  });
  expect(result.error).not.toBeUndefined();

  result = tournamentEngine.createGroupParticipant({
    individualParticipantIds,
    groupName,
  });
  expect(result.success).toEqual(true);
  expect(participantAddCounter).toBeGreaterThan(0);

  const { tournamentRecord: updatedTournamentRecord } =
    tournamentEngine.getState();
  const { tournamentParticipants: groupParticipants } =
    getTournamentParticipants({
      tournamentRecord: updatedTournamentRecord,
      participantFilters: { participantTypes: [GROUP] },
    });

  expect(groupParticipants.length).toEqual(1);
});

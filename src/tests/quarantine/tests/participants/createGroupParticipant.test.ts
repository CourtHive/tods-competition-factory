import { getParticipants } from '../../../../query/participants/getParticipants';
import { setSubscriptions } from '../../../../global/state/globalState';
import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../engines/tournamentEngine';
import { expect, it } from 'vitest';

import { GROUP, INDIVIDUAL } from '../../../../constants/participantConstants';
import { ADD_PARTICIPANTS } from '../../../../constants/topicConstants';

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
  const individualParticipants =
    getParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
      tournamentRecord,
    }).participants ?? [];

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
    tournamentEngine.getTournament();
  const { participants: groupParticipants } = getParticipants({
    tournamentRecord: updatedTournamentRecord,
    participantFilters: { participantTypes: [GROUP] },
  });

  expect(groupParticipants?.length).toEqual(1);
});

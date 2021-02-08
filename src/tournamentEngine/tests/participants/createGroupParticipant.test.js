import tournamentEngine from '../../sync';
import mocksEngine from '../../../mocksEngine';
import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';

import { GROUP, INDIVIDUAL } from '../../../constants/participantTypes';

it('can create group participants', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();

  tournamentEngine.setState(tournamentRecord);
  const {
    tournamentParticipants: individualParticipants,
  } = getTournamentParticipants({
    tournamentRecord,
    participantFilters: { participantTypes: [INDIVIDUAL] },
  });

  const [participant1, participant2] = individualParticipants;

  const individualParticipantIds = [
    participant1.participantId,
    participant2.participantId,
  ];
  let result = tournamentEngine.createGroupParticipant({
    individualParticipantIds,
  });
  expect(result.error).not.toBeUndefined();

  const groupName = 'Group Name';
  result = tournamentEngine.createGroupParticipant({
    individualParticipantIds,
    groupName,
  });
  expect(result.success).toEqual(true);

  const {
    tournamentRecord: updatedTournamentRecord,
  } = tournamentEngine.getState();
  const {
    tournamentParticipants: groupParticipants,
  } = getTournamentParticipants({
    tournamentRecord: updatedTournamentRecord,
    participantFilters: { participantTypes: [GROUP] },
  });

  expect(groupParticipants.length).toEqual(1);
});

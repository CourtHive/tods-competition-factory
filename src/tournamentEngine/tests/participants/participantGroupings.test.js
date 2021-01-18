import tournamentEngine from '../..';
import mocksEngine from '../../../mocksEngine';

import {
  INVALID_PARTICIPANT_IDS,
  INVALID_PARTICIPANT_TYPE,
  INVALID_VALUES,
  MISSING_VALUE,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { OTHER } from '../../../constants/participantRoles';
import { GROUP, INDIVIDUAL } from '../../../constants/participantTypes';

it('can add a GROUP participant and add individualParticipantIds', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [INDIVIDUAL] },
    }
  );

  // test adding invalid individualParticipantIds, in this case entire participants
  let participantIds = tournamentParticipants.slice(0, 3);
  let result = tournamentEngine.addParticipant({
    participant: {
      participantType: GROUP,
      participantRole: OTHER,
      individualParticipantIds: participantIds,
    },
  });
  expect(result.error).not.toBeUndefined();
  expect(result.error[0].error).toEqual(INVALID_VALUES);

  // test adding non-existent individualParticipantIds
  result = tournamentEngine.addParticipant({
    participant: {
      participantType: GROUP,
      participantRole: OTHER,
      individualParticipantIds: ['abc', '123'],
    },
  });
  expect(result.error).not.toBeUndefined();
  expect(result.error[0].error).toEqual(PARTICIPANT_NOT_FOUND);

  // first three individual participants belong to groupParticipant
  participantIds = tournamentParticipants
    .slice(0, 3)
    .map((participant) => participant.participantId);

  result = tournamentEngine.devContext(true).addParticipant({
    participant: {
      participantType: GROUP,
      participantRole: OTHER,
      individualParticipantIds: participantIds,
    },
  });
  expect(result.success).toEqual(true);

  const groupingParticipant = result.participant;
  const { participantId: groupingParticipantId } = groupingParticipant;

  result = tournamentEngine.addIndividualParticipantIds();
  expect(result.error).toEqual(MISSING_VALUE);
  result = tournamentEngine.addIndividualParticipantIds({
    groupingParticipantId,
  });
  expect(result.error).toEqual(MISSING_VALUE);

  let individualParticipantIds = tournamentParticipants.slice(0, 4);
  result = tournamentEngine.addIndividualParticipantIds({
    groupingParticipantId,
    individualParticipantIds,
  });
  expect(result.error).not.toBeUndefined();
  expect(result.error).toEqual(INVALID_PARTICIPANT_IDS);

  individualParticipantIds = tournamentParticipants
    .slice(0, 4)
    .map((participant) => participant.participantId);

  // attempt to add to non-existent group participant
  result = tournamentEngine.addIndividualParticipantIds({
    groupingParticipantId: 'abc',
    individualParticipantIds,
  });
  expect(result.error).toEqual(PARTICIPANT_NOT_FOUND);

  // attempt to add to to non-grouping participantType
  result = tournamentEngine.addIndividualParticipantIds({
    groupingParticipantId: individualParticipantIds[0],
    individualParticipantIds,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_TYPE);

  result = tournamentEngine.addIndividualParticipantIds({
    groupingParticipantId,
    individualParticipantIds,
  });
  expect(result.added).toEqual(1);
  expect(result.groupingParticipant.individualParticipantIds.length).toEqual(4);

  result = tournamentEngine.addIndividualParticipantIds({
    groupingParticipantId,
    individualParticipantIds,
  });
  expect(result.added).toEqual(0);
  expect(result.groupingParticipant.individualParticipantIds.length).toEqual(4);
});

it('can add a GROUP participant and remove individualParticipantIds', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [INDIVIDUAL] },
    }
  );

  // first four individual participants belong to groupParticipant
  let individualParticipantIds = tournamentParticipants
    .slice(0, 4)
    .map((participant) => participant.participantId);

  let result = tournamentEngine.devContext(true).addParticipant({
    participant: {
      participantType: GROUP,
      participantRole: OTHER,
      individualParticipantIds,
    },
  });
  expect(result.success).toEqual(true);

  const groupingParticipant = result.participant;
  const { participantId: groupingParticipantId } = groupingParticipant;

  result = tournamentEngine.removeIndividualParticipantIds({
    groupingParticipantId,
  });
  expect(result.error).toEqual(MISSING_VALUE);

  // attempting to remove a non-existent individualParticipantId is SUCCESS
  result = tournamentEngine.removeIndividualParticipantIds({
    groupingParticipantId,
    individualParticipantIds: ['abc'],
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.removeIndividualParticipantIds({
    groupingParticipantId: individualParticipantIds[0],
    individualParticipantIds,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_TYPE);

  result = tournamentEngine.removeIndividualParticipantIds({
    groupingParticipantId,
    individualParticipantIds: individualParticipantIds.slice(2),
  });
  expect(result.success).toEqual(true);
  expect(result.removed).toEqual(2);
});

it('can modify individualParticipantIds of a grouping participant', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [INDIVIDUAL] },
    }
  );

  // first four individual participants belong to groupParticipant
  const individualParticipantIds = tournamentParticipants
    .slice(0, 4)
    .map((participant) => participant.participantId);

  let result = tournamentEngine.devContext(true).addParticipant({
    participant: {
      participantType: GROUP,
      participantRole: OTHER,
      individualParticipantIds,
    },
  });
  expect(result.success).toEqual(true);

  const groupingParticipant = result.participant;
  const { participantId: groupingParticipantId } = groupingParticipant;

  let { participant } = tournamentEngine.findParticipant({
    participantId: groupingParticipantId,
  });
  expect(individualParticipantIds).toEqual(
    participant.individualParticipantIds
  );

  const newIndividualParticipantIds = tournamentParticipants
    .slice(2, 6)
    .map((participant) => participant.participantId);

  result = tournamentEngine.modifyIndividualParticipantIds({
    groupingParticipantId,
  });
  expect(result.error).toEqual(MISSING_VALUE);

  result = tournamentEngine.devContext(true).modifyIndividualParticipantIds({
    groupingParticipantId,
    individualParticipantIds: newIndividualParticipantIds,
  });
  expect(result.added).toEqual(2);
  expect(result.removed).toEqual(2);
  expect(result.success).toEqual(true);

  ({ participant } = tournamentEngine.findParticipant({
    participantId: groupingParticipantId,
  }));

  expect(newIndividualParticipantIds).toEqual(
    participant.individualParticipantIds
  );
});

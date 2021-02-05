import { tournamentEngine } from '../../sync';
import mocksEngine from '../../../mocksEngine';
import { UUID } from '../../../utilities';

import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { COMPETITOR } from '../../../constants/participantRoles';
import {
  INVALID_PARTICIPANT_IDS,
  INVALID_PARTICIPANT_TYPE,
  MISSING_PARTICIPANT_ROLE,
  MISSING_PERSON_DETAILS,
  PARTICIPANT_ID_EXISTS,
  PARTICIPANT_PAIR_EXISTS,
} from '../../../constants/errorConditionConstants';

it('will not add the same participantId twice', () => {
  let result = tournamentEngine.newTournamentRecord();
  expect(result?.success).toEqual(true);

  const participantId = UUID();
  let participant = {
    participantId,
    participantRole: COMPETITOR,
    participantType: INDIVIDUAL,
    person: {
      standardFamilyName: 'Family',
      standardGivenName: 'Given',
    },
  };

  result = tournamentEngine.addParticipant({ participant });
  expect(result.success).toEqual(true);

  result = tournamentEngine.addParticipant({ participant });
  expect(result.error).toEqual(PARTICIPANT_ID_EXISTS);
});

it('will not add invalid individual participants', () => {
  let result = tournamentEngine.newTournamentRecord();
  expect(result?.success).toEqual(true);

  let participant = {
    participantRole: COMPETITOR,
    person: {
      standardFamilyName: 'Family',
      standardGivenName: 'Given',
    },
  };

  result = tournamentEngine.addParticipant({ participant });
  expect(result.error).toEqual(INVALID_PARTICIPANT_TYPE);

  participant = {
    participantType: INDIVIDUAL,
    person: {
      standardFamilyName: 'Family',
      standardGivenName: 'Given',
    },
  };

  result = tournamentEngine.addParticipant({ participant });
  expect(result.error).toEqual(MISSING_PARTICIPANT_ROLE);

  participant = {
    participantType: INDIVIDUAL,
    participantRole: COMPETITOR,
  };

  result = tournamentEngine.addParticipant({ participant });
  expect(result.error).toEqual(MISSING_PERSON_DETAILS);

  participant = {
    participantType: INDIVIDUAL,
    participantRole: COMPETITOR,
    person: {
      standardGivenName: 'Given',
    },
  };

  result = tournamentEngine.addParticipant({ participant });
  expect(result.error).toEqual(MISSING_PERSON_DETAILS);

  participant = {
    participantType: INDIVIDUAL,
    participantRole: COMPETITOR,
    person: {
      standardFamilyName: 'Family',
    },
  };

  result = tournamentEngine.addParticipant({ participant });
  expect(result.error).toEqual(MISSING_PERSON_DETAILS);

  participant = {
    participantType: INDIVIDUAL,
    participantRole: COMPETITOR,
    person: {
      standardFamilyName: 'Family',
      standardGivenName: 'Given',
    },
  };

  result = tournamentEngine.addParticipant({ participant });
  expect(result.success).toEqual(true);
});

it('can add individual and pair participants', () => {
  let result = tournamentEngine.newTournamentRecord();
  expect(result?.success).toEqual(true);

  const participant1 = {
    participantType: INDIVIDUAL,
    participantRole: COMPETITOR,
    person: {
      standardFamilyName: 'Family',
      standardGivenName: 'Given',
    },
  };

  const participant2 = {
    participantType: INDIVIDUAL,
    participantRole: COMPETITOR,
    person: {
      standardFamilyName: 'Family',
      standardGivenName: 'Given',
    },
  };

  const individualParticipantIds = [];
  result = tournamentEngine
    .devContext(true)
    .addParticipant({ participant: participant1 });
  expect(result.success).toEqual(true);
  individualParticipantIds.push(result.participant.participantId);

  result = tournamentEngine
    .devContext(true)
    .addParticipant({ participant: participant2 });
  expect(result.success).toEqual(true);
  individualParticipantIds.push(result.participant.participantId);

  const pairParticipant = {
    participantType: PAIR,
    participantRole: COMPETITOR,
    individualParticipantIds,
  };
  result = tournamentEngine.addParticipant({ participant: pairParticipant });
  expect(result.success).toEqual(true);

  const { tournamentRecord } = tournamentEngine.getState();
  expect(tournamentRecord.participants.length).toEqual(3);
});

it('will not add invalid PAIR participants', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    inContext: true,
  });
  tournamentEngine.setState(tournamentRecord);

  let pairParticipant = {
    participantType: PAIR,
    participantRole: COMPETITOR,
    individualParticipantIds: ['abc'],
  };
  let result = tournamentEngine.addParticipant({
    participant: pairParticipant,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_IDS);
  expect(result.message).not.toBeUndefined();

  pairParticipant = {
    participantType: PAIR,
    participantRole: COMPETITOR,
    individualParticipantIds: ['abc', 'def'],
  };
  result = tournamentEngine.addParticipant({
    participant: pairParticipant,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_IDS);
  expect(result.message).toBeUndefined();

  const {
    tournamentParticipants: individualParticipants,
  } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
  });

  // cannot add 3 individualParticipantIds for PAIR
  const threePrticipantIds = individualParticipants
    .slice(0, 3)
    .map((participant) => participant.participantId);
  pairParticipant = {
    participantType: PAIR,
    participantRole: COMPETITOR,
    individualParticipantIds: threePrticipantIds,
  };
  result = tournamentEngine.addParticipant({
    participant: pairParticipant,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_IDS);
  expect(result.message).not.toBeUndefined();

  // individualParticipants instead of individualParticipantIds
  const participants = individualParticipants.slice(0, 2);
  pairParticipant = {
    participantType: PAIR,
    participantRole: COMPETITOR,
    individualParticipantIds: participants,
  };
  result = tournamentEngine.addParticipant({
    participant: pairParticipant,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_IDS);

  // expect success
  let individualParticipantIds = individualParticipants
    .slice(0, 2)
    .map((participant) => participant.participantId);
  pairParticipant = {
    participantType: PAIR,
    participantRole: COMPETITOR,
    individualParticipantIds,
  };
  result = tournamentEngine.devContext(true).addParticipant({
    participant: pairParticipant,
  });
  expect(result.success).toEqual(true);
  const pairParticipantId = result.participant.participantId;

  const {
    tournamentParticipants: pairParticipants,
  } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [PAIR] },
  });
  const pairParticipantIds = pairParticipants.map(
    (participant) => participant.participantId
  );
  expect(pairParticipantIds.includes(pairParticipantId)).toEqual(true);

  pairParticipant = {
    participantType: PAIR,
    participantRole: COMPETITOR,
    individualParticipantIds,
  };
  result = tournamentEngine.addParticipant({
    participant: pairParticipant,
  });
  expect(result.error).toEqual(PARTICIPANT_PAIR_EXISTS);

  result = tournamentEngine.participantMembership({
    participantId: individualParticipantIds[0],
  });
  expect(result[PAIR].length).toEqual(1);
  expect(result[PAIR][0].participantId).toEqual(pairParticipantId);
});

import { intersection, makeDeepCopy } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { INDIVIDUAL, PAIR } from '../../../constants/participantConstants';
import { MALE } from '../../../constants/genderConstants';

tournamentEngine.devContext(true);

it('can modify participants', () => {
  const participantsProfile = {
    participantsCount: 10,
    participantType: PAIR,
    sex: MALE,
  };
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile,
  });

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants: individualParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
    });
  expect(individualParticipants.length).toEqual(20);

  const individualParticipant = individualParticipants[0];
  const person = {
    standardFamilyName: 'Sampras',
    standardGivenName: 'Pete',
    nationalityCode: 'USA',
  };
  const updatedIndividualParticipant = Object.assign(
    {},
    individualParticipant,
    { person }
  );
  let result = tournamentEngine.modifyParticipant({
    participant: updatedIndividualParticipant,
  });
  expect(result.success).toEqual(true);
  expect(result.participant.participantName).toEqual(
    `${person.standardGivenName} ${person.standardFamilyName}`
  );

  const secondIndividual = individualParticipants[0];
  const updatedSecondIndividual = Object.assign({}, secondIndividual, {
    participantOtherName: 'Other',
  });
  result = tournamentEngine.modifyParticipant({
    participant: updatedSecondIndividual,
  });
  expect(result.success).toEqual(true);
  expect(result.participant.participantOtherName).toEqual('Other');

  const { tournamentParticipants: pairParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [PAIR] },
    });
  expect(pairParticipants.length).toEqual(10);
  const pairParticipant = pairParticipants[0];

  const newIndividualParticipant = individualParticipants.filter(
    ({ participantId }) =>
      !pairParticipant.individualParticipantIds.includes(participantId)
  )[0];

  const updatedPairParticipant = makeDeepCopy(pairParticipant);
  const individualParticipantIds =
    updatedPairParticipant.individualParticipantIds;
  individualParticipantIds[0] = newIndividualParticipant.participantId;

  result = tournamentEngine.modifyParticipant({
    participant: updatedPairParticipant,
  });
  expect(result.success).toEqual(true);

  // split the previous and new participantNames and expect the overlap to = 1
  expect(
    intersection(
      pairParticipant.participantName.split('/'),
      result.participant.participantName.split('/')
    ).length
  ).toEqual(1);

  expect(
    intersection(
      pairParticipant.individualParticipantIds,
      result.participant.individualParticipantIds
    ).length
  ).toEqual(1);

  const modifiedSecondIndividual = makeDeepCopy(updatedSecondIndividual);
  let nationalityCode = modifiedSecondIndividual.person.nationalityCode;

  modifiedSecondIndividual.person.nationalityCode = 'XXX';
  result = tournamentEngine.modifyParticipant({
    participant: modifiedSecondIndividual,
  });
  // fail silently, do not apply invalid nationalityCode
  expect(result.participant.person.nationalityCode).toEqual(nationalityCode);

  modifiedSecondIndividual.person.nationalityCode = 'USA';
  result = tournamentEngine.modifyParticipant({
    participant: modifiedSecondIndividual,
  });
  expect(result.participant.person.nationalityCode).toEqual('USA');
});

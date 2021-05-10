import tournamentEngine from '../../sync';
import mocksEngine from '../../../mocksEngine';

import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { MALE } from '../../../constants/genderConstants';
import { intersection, makeDeepCopy } from '../../../utilities';

it('can retrieve tournament participants', () => {
  const participantsProfile = {
    participantsCount: 10,
    participantType: PAIR,
    sex: MALE,
  };
  mocksEngine.generateTournamentRecord({ participantsProfile });

  tournamentEngine.devContext(true);

  const { tournamentParticipants: individualParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
    });
  expect(individualParticipants.length).toEqual(10);
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

  const { tournamentParticipants: pairParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [PAIR] },
    });
  expect(pairParticipants.length).toEqual(5);
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
});

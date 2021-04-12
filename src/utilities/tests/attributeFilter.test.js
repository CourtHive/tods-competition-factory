import { attributeFilter } from '../attributeFilter';
import { MALE } from '../../constants/genderConstants';
import { INDIVIDUAL } from '../../constants/participantTypes';

it('can filter attributes from arrays of object', () => {
  const privacy = {
    participantName: true,
    participantId: true,
    participantRole: false,
    participantStatus: false,
    participantType: true,
    person: {
      addresses: [
        {
          city: 'Cuernavaca',
          state: 'Morelos',
          countryCode: false,
          addressLine1: false,
          addressLine2: false,
        },
      ],
      birthDate: false,
      nationalityCode: true,
      nativeFamilyName: false,
      nativeGivenName: false,
      sex: false,
      standardFamilyName: true,
      standardGivenName: true,
    },
  };
  const participant = {
    participantName: 'Ivan Illich',
    participantId: '1234567',
    participantRole: 'Educator',
    participantStatus: 'Deceased',
    participantType: INDIVIDUAL,
    person: {
      addresses: [
        {
          city: 'Cuernavaca',
          state: 'Morelos',
          countryCode: 'MEX',
          addressLine1: 'P.O. Box 1234',
          addressLine2: 'Some Street',
        },
      ],
      birthDate: '2026-09-04',
      nationalityCode: 'AUT',
      nativeFamilyName: 'Illich',
      nativeGivenName: 'Ivan',
      sex: MALE,
      standardFamilyName: 'Illich',
      standardGivenName: 'Ivan',
    },
  };

  const filteredParticipant = attributeFilter({
    source: participant,
    template: privacy,
  });

  const expectedParticipant = {
    participantName: 'Ivan Illich',
    participantId: '1234567',
    participantType: 'INDIVIDUAL',
    person: {
      addresses: [{ city: 'Cuernavaca', state: 'Morelos' }],
      nationalityCode: 'AUT',
      standardFamilyName: 'Illich',
      standardGivenName: 'Ivan',
    },
  };

  expect(filteredParticipant).toEqual(expectedParticipant);
});

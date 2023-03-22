import { attributeFilter } from '../attributeFilter';
import { expect, it } from 'vitest';

import { INDIVIDUAL } from '../../constants/participantConstants';
import { MALE } from '../../constants/genderConstants';

it('handles bad data', () => {
  let result = attributeFilter();
  expect(result).toEqual();
  result = attributeFilter('');
  expect(result).toEqual();
  result = attributeFilter(null);
  expect(result).toEqual({});
  result = attributeFilter(undefined);
  expect(result).toEqual();
  result = attributeFilter(1);
  expect(result).toEqual();
});

it('can filter attributes from arrays of object', () => {
  const privacy = {
    participantName: true,
    participantId: true,
    participantRole: false,
    participantStatus: false,
    participantType: true,
    person: {
      addresses: {
        city: 'Cuernavaca',
        state: 'Morelos',
        countryCode: false,
        addressLine1: false,
        addressLine2: false,
      },
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

it('supports templates which contain objects not present in source', () => {
  const privacy = {
    participantName: true,
    participantId: true,
    participantRole: false,
    participantStatus: false,
    participantType: true,
    person: {
      addresses: {
        city: 'Cuernavaca',
        state: 'Morelos',
        countryCode: false,
        addressLine1: false,
        addressLine2: false,
      },
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
      nationalityCode: 'AUT',
      standardFamilyName: 'Illich',
      standardGivenName: 'Ivan',
    },
  };

  expect(filteredParticipant).toEqual(expectedParticipant);
});

it('supports sources which contain attributes not present in templates', () => {
  const privacy = {
    participantName: true,
    participantId: true,
    participantRole: false,
    participantStatus: false,
    participantType: true,
    person: {
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
      nationalityCode: 'AUT',
      standardFamilyName: 'Illich',
      standardGivenName: 'Ivan',
    },
  };

  expect(filteredParticipant).toEqual(expectedParticipant);
});

it('can apply the same filter template to multiple attributes', () => {
  const source = {
    ratings: {
      DOUBLES: [
        {
          scaleValue: {
            wtnRating: 29.35,
            confidence: 70,
            gameZoneLower: 31.14,
            gameZoneUpper: 27.57,
          },
          scaleName: 'WTN',
        },
      ],
      SINGLES: [
        {
          scaleValue: {
            ageCategoryCode: 'OPEN',
            eventSubType: 'SINGLES',
            eventType: 'ADULT',
            confidence: 90,
            wtnRating: 24.52,
            wtnRatingDate: '2022-05-27T09:54:44.383Z',
          },
          scaleName: 'WTN',
        },
        {
          scaleValue: {
            ratingType: 'NTRP',
            benchmarkType: '',
            dntrpRatingHundredths: 0,
            eventSubType: 'SINGLES',
            eventType: 'ADULT',
            ntrpRating: 0,
            ntrpRatingHundredths: 0,
            ratingDate: '0001-01-01T00:00:00',
            ratingExpiration: '0001-01-01T00:00:00',
            ratingYear: 0,
            updatedAt: '0001-01-01T00:00:00',
            ustaRatingType: '',
          },
          scaleName: 'NTRP',
        },
      ],
    },
  };

  let template = {
    ratings: {
      'SINGLES||DOUBLES': {
        scaleName: ['WTN'],
        scaleValue: { wtnRating: true },
      },
    },
  };

  let filteredObject = attributeFilter({
    template,
    source,
  });

  expect(filteredObject.ratings.SINGLES).not.toBeUndefined();
  expect(filteredObject.ratings.SINGLES.length).toEqual(1);
  expect(filteredObject.ratings.DOUBLES).not.toBeUndefined();

  template = {
    ratings: {
      'SINGLES||DOUBLES': {
        scaleName: ['WTN', 'NTRP'],
        scaleValue: { wtnRating: true, ntrpRating: true },
      },
    },
  };

  filteredObject = attributeFilter({
    template,
    source,
  });

  expect(filteredObject.ratings.SINGLES).not.toBeUndefined();
  expect(filteredObject.ratings.SINGLES.length).toEqual(2);
  expect(filteredObject.ratings.DOUBLES).not.toBeUndefined();

  template = {
    ratings: {
      'SINGLES||DOUBLES': {
        scaleName: ['NTRP'],
        scaleValue: {
          '*': true,
          ntrpRatingHundredths: false,
          dntrpRatingHundredths: false,
        },
      },
    },
  };

  filteredObject = attributeFilter({
    template,
    source,
  });

  expect(filteredObject.ratings.SINGLES.length).toEqual(1);

  const rating = filteredObject.ratings.SINGLES[0];
  expect(rating.scaleName).toEqual('NTRP');
  expect(rating.scaleValue.ntrpRatingHundredths).toBeUndefined();
  expect(rating.scaleValue.dntrpRatingHundredths).toBeUndefined();
  expect(rating.scaleValue.eventType).toEqual('ADULT');
});

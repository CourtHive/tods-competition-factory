import { cityMocks, stateMocks, postalCodeMocks } from '../utilities/address';
import { generateRange, shuffleArray, UUID } from '../../utilities';
import { countries } from '../../fixtures/countryData';
import { personMocks } from '../utilities/personMocks';
import { teamMocks } from '../utilities/teamMocks';

import { INDIVIDUAL, PAIR, TEAM } from '../../constants/participantTypes';
import { COMPETITOR } from '../../constants/participantRoles';
import { DOUBLES } from '../../constants/matchUpTypes';

/**
 *
 * Generate mock participants
 *
 * @param {string[]} nationalityCodes - an array of ISO codes to randomly assign to participants
 * @param {number} nationalityCodesCount - number of nationality codes to use when generating participants
 * @param {number} participantsCount - number of participants to generate
 * @param {string} participantType - [INDIVIDUAL, PAIR, TEAM]
 * @param {number[]} personIds - optional array of pre-defined personIds
 * @param {string} matchUpType - optional - [SINGLES, DOUBLES] - forces PAIR participant generation if DOUBLES
 * @param {string} sex - optional - [MALE, FEMALE]
 * @param {number} valuesInstanceLimit - maximum number of values which can be the same
 * @param {number} valuesCount - number of values to generate
 * @param {boolean} inContext - whether to expand PAIR and TEAM individualParticipantIds => individualParticipant objects
 * @param {object[]} personData - optional array of persons to seed generator [{ firstName, lastName, sex, nationalityCode }]
 * @param {object} personExtensions - optional array of extentsions to apply to all persons
 *
 */
export function generateParticipants({
  valuesInstanceLimit,
  nationalityCodesCount,
  nationalityCodeType,
  nationalityCodes,

  participantsCount = 32,
  participantType,
  personIds,
  uuids,

  personExtensions,
  addressProps,
  matchUpType,
  personData,
  sex,

  inContext,
}) {
  const doubles = participantType === PAIR || matchUpType === DOUBLES;
  const team = participantType === TEAM || matchUpType === TEAM;
  const individualParticipantsCount =
    participantsCount * (doubles ? 2 : team ? 8 : 1);

  const { persons: mockedPersons, error } = personMocks({
    count: individualParticipantsCount,
    personExtensions,
    personData,
    sex,
  });
  if (error) return { error };

  const isoCountries = countries.filter((country) =>
    nationalityCodeType === 'ISO' ? country.iso : country.ioc
  );
  const { citiesCount, statesCount, postalCodesCount } = addressProps || {};

  function getMin(count) {
    const instances = Math.ceil(individualParticipantsCount / count);
    if (valuesInstanceLimit && instances > valuesInstanceLimit)
      return Math.ceil(individualParticipantsCount / valuesInstanceLimit);
    return count;
  }

  const { cities } = cityMocks({
    count: citiesCount || individualParticipantsCount,
    participantsCount: individualParticipantsCount,
  });
  const { states } = stateMocks({
    count: statesCount || individualParticipantsCount,
    participantsCount: individualParticipantsCount,
  });
  const { postalCodes } = postalCodeMocks({
    count: postalCodesCount || individualParticipantsCount,
    participantsCount: individualParticipantsCount,
  });
  const addressValues = { cities, states, postalCodes };

  const isoMin = getMin(nationalityCodesCount);
  const isoList = isoMin
    ? shuffleArray(isoCountries).slice(0, nationalityCodesCount)
    : nationalityCodes
    ? isoCountries.filter((isoCountry) =>
        nationalityCodes.includes(isoCountry.key)
      )
    : isoCountries;

  const countriesList = shuffleArray(
    generateRange(0, Math.ceil(individualParticipantsCount / (isoMin || 1)))
      .map(() => isoList)
      .flat(Infinity)
  );

  const teamNames = teamMocks({ count: participantsCount }).teams;
  const participants = generateRange(0, participantsCount)
    .map((i) => {
      const sideParticipantsCount = doubles ? 2 : team ? 8 : 1;
      const individualParticipants = generateRange(
        0,
        sideParticipantsCount
      ).map((j) => {
        const participantIndex = i * sideParticipantsCount + j;
        return generateIndividualParticipant(participantIndex);
      });

      const individualParticipantIds = individualParticipants.map(
        (participant) => participant.participantId
      );

      const pairName = individualParticipants
        .map((i) => i.person.standardFamilyName)
        .join('/');

      const groupParticipant = {
        participantId: uuids?.pop() || UUID(),
        participantType: doubles ? PAIR : TEAM,
        participantRole: COMPETITOR,
        participantName: doubles ? pairName : teamNames[0],
        individualParticipantIds,
      };

      if (inContext)
        groupParticipant.individualParticipants = individualParticipants;

      return doubles || team
        ? [groupParticipant, ...individualParticipants]
        : individualParticipants;
    })
    .flat();

  return { participants };

  function generateIndividualParticipant(participantIndex) {
    const person = mockedPersons[participantIndex];
    const {
      sex,
      firstName,
      lastName,
      extensions,
      nationalityCode: personNationalityCode,
    } = person || {};
    const standardGivenName = firstName || 'GivenName';
    const standardFamilyName = lastName || 'FamilyName';
    const participantName = `${standardGivenName} ${standardFamilyName}`;
    const country = countriesList[participantIndex];
    const nationalityCode =
      (country && (country.ioc || country.iso)) || personNationalityCode;

    if (countriesList?.length && !nationalityCode && !personNationalityCode) {
      console.log('%c Invalid Nationality Code', { participantIndex, country });
    }
    const address = generateAddress({
      ...addressValues,
      participantIndex,
      nationalityCode,
    });
    const participant = {
      participantId: uuids?.pop() || UUID(),
      participantType: INDIVIDUAL,
      participantRole: COMPETITOR,
      participantName,
      person: {
        addresses: [address],
        personId: (personIds?.length && personIds[participantIndex]) || UUID(),
        standardFamilyName,
        standardGivenName,
        nationalityCode,
        extensions,
        sex,
      },
    };

    return participant;
  }
}

function generateAddress(addressAttributes) {
  const { cities, states, postalCodes, nationalityCode, participantIndex } =
    addressAttributes;
  const address = {
    city: cities && cities[participantIndex],
    state: states && states[participantIndex],
    postalCode: postalCodes && postalCodes[participantIndex],
    countryCode: nationalityCode,
  };
  return address;
}

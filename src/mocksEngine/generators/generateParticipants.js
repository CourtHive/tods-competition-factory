import { countries } from '../../fixtures/countryData';
import { generateRange, shuffleArray, UUID } from '../../utilities';
import { cityMocks, stateMocks, postalCodeMocks } from '../utilities/address';
import { teamMocks } from '../utilities/team';
import { personMocks } from '../utilities/person';

import { COMPETITOR } from '../../constants/participantRoles';
import { INDIVIDUAL, PAIR, TEAM } from '../../constants/participantTypes';
import { DOUBLES } from '../../constants/matchUpTypes';

/**
 *
 * Generate mock participants
 *
 * @param {string[]} nationalityCodes - an array of ISO codes to randomly assign to participants
 * @param {number} nationalityCodesCount - number of nationality codes to use when generating participants
 * @param {number} participantsCount - number of participants to generate
 * @param {string} participantType - [INDIVIDUAL, PAIR, TEAM]
 * @param {string} matchUpType - optional - [SINGLES, DOUBLES] - forces PAIR participant generation if DOUBLES
 * @param {string} sex - optional - [MALE, FEMALE]
 * @param {number} valuesInstanceLimit - maximum number of values which can be the same
 * @param {number} valuesCount - number of values to generate
 * @param {boolean} inContext - whether to expand PAIR and TEAM individualParticipantIds => individualParticipant objects
 *
 */
export function generateParticipants({
  nationalityCodes,
  nationalityCodesCount,
  participantsCount = 32,
  valuesInstanceLimit,

  participantType,
  addressProps,
  matchUpType,
  sex,

  inContext,
}) {
  const doubles = participantType === PAIR || matchUpType === DOUBLES;
  const team = participantType === TEAM || matchUpType === TEAM;
  const individualParticipantsCount =
    participantsCount * (doubles ? 2 : team ? 8 : 1);

  const { persons: mockedPersons } = personMocks({
    sex,
    count: individualParticipantsCount,
  });
  const isoCountries = countries.filter((country) => country.iso);
  const { citiesCount, statesCount, postalCodesCount } = addressProps || {};

  function getMin(count) {
    const instances = Math.ceil(individualParticipantsCount / count);
    if (valuesInstanceLimit && instances > valuesInstanceLimit)
      return Math.ceil(individualParticipantsCount / valuesInstanceLimit);
    return count;
  }

  const { cities } = cityMocks({ count: citiesCount });
  const { states } = stateMocks({ count: statesCount });
  const { postalCodes } = postalCodeMocks({ count: postalCodesCount });
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
        participantId: UUID(),
        participantType: doubles ? PAIR : TEAM,
        participantRole: COMPETITOR,
        participantName: doubles ? pairName : teamMocks().teams[0],
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
    const { firstName, lastName, extensions, nationalityCode } = person || {};
    const standardGivenName = firstName || 'GivenName';
    const standardFamilyName = lastName || 'FamilyName';
    const participantName = `${standardGivenName} ${standardFamilyName}`;
    const country = countriesList[participantIndex];
    const mockedNationalityCode = country && (country.ioc || country.iso);
    if (countriesList?.length && !nationalityCode && !mockedNationalityCode) {
      console.log('%c Invalid Nationality Code', { participantIndex, country });
    }
    const address = generateAddress({
      ...addressValues,
      participantIndex,
      nationalityCode: mockedNationalityCode || nationalityCode,
    });
    const participant = {
      participantId: UUID(),
      participantType: INDIVIDUAL,
      participantRole: COMPETITOR,
      participantName,
      person: {
        addresses: [address],
        personId: UUID(),
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
  const {
    cities,
    states,
    postalCodes,
    nationalityCode,
    participantIndex,
  } = addressAttributes;
  const address = {
    city: cities && cities[participantIndex],
    state: states && states[participantIndex],
    postalCode: postalCodes && postalCodes[participantIndex],
    countryCode: nationalityCode,
  };
  return address;
}

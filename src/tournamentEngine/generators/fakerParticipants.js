import Faker from 'faker';
import { countries } from '../../fixtures/countryData';
import { unique, generateRange, shuffleArray } from '../../utilities';

import { COMPETITOR } from '../../constants/participantRoles';
import { INDIVIDUAL, PAIR, TEAM } from '../../constants/participantTypes';
import { DOUBLES } from '../../constants/matchUpTypes';

export function generateFakeParticipants({
  nationalityCodes,
  nationalityCodesCount,
  participantsCount = 32,
  valuesInstanceLimit,

  participantType,
  addressProps,
  matchUpType,
  sex,
}) {
  const doubles = participantType === PAIR || matchUpType === DOUBLES;
  const team = participantType === TEAM || matchUpType === TEAM;
  const individualParticipantsCount =
    participantsCount * (doubles ? 2 : team ? 8 : 1);

  const isoCountries = countries.filter(country => country.iso);
  const { citiesCount, statesCount, postalCodesCount } = addressProps || {};

  function getMin(count) {
    const instances = Math.ceil(individualParticipantsCount / count);
    if (valuesInstanceLimit && instances > valuesInstanceLimit)
      return Math.ceil(individualParticipantsCount / valuesInstanceLimit);
    return count;
  }

  function getList(count, fx) {
    const minItems = count && getMin(count);
    const items =
      minItems &&
      unique(generateRange(0, minItems * 4).map(() => fx())).slice(0, minItems);
    const list = generateRange(
      0,
      Math.ceil(individualParticipantsCount / minItems)
    )
      .map(() => items)
      .flat(Infinity);
    return shuffleArray(list);
  }

  const cities = getList(citiesCount, Faker.address.city);
  const states = getList(statesCount, Faker.address.state);
  const postalCodes = getList(postalCodesCount, Faker.address.zipCode);
  const addressValues = { cities, states, postalCodes };

  const isoMin = getMin(nationalityCodesCount);
  const isoList = isoMin
    ? shuffleArray(isoCountries).slice(0, nationalityCodesCount)
    : nationalityCodes
    ? isoCountries.filter(isoCountry =>
        nationalityCodes.includes(isoCountry.key)
      )
    : isoCountries;

  const countriesList = shuffleArray(
    generateRange(0, Math.ceil(individualParticipantsCount / isoMin))
      .map(() => isoList)
      .flat(Infinity)
  );

  const participants = generateRange(0, participantsCount)
    .map(i => {
      const sideParticipantsCount = doubles ? 2 : team ? 8 : 1;
      const individualParticipants = generateRange(
        0,
        sideParticipantsCount
      ).map(j => {
        const participantIndex = i * sideParticipantsCount + j;
        return generateIndividualParticipant(participantIndex);
      });

      const pairName = individualParticipants
        .map(i => i.person.standardFamilyName)
        .join('/');
      const teamName = Faker.company.companyName();

      const groupParticipant = {
        participantId: Faker.random.uuid(),
        participantType: doubles ? PAIR : TEAM,
        participantRole: COMPETITOR,
        name: doubles ? pairName : teamName,
        individualParticipants,
      };
      return doubles || team
        ? [groupParticipant, ...individualParticipants]
        : individualParticipants;
    })
    .flat();

  return { participants };

  function generateIndividualParticipant(participantIndex) {
    const standardGivenName = Faker.name.firstName();
    const standardFamilyName = Faker.name.lastName();
    const name = `${standardFamilyName.toUpperCase()}, ${standardGivenName}`;
    const country = countriesList[participantIndex];
    const nationalityCode = country && (country.ioc || country.iso);
    if (countriesList?.length && !nationalityCode) {
      console.log('%c Invalid Nationality Code', { participantIndex, country });
    }
    const address = generateAddress({
      ...addressValues,
      participantIndex,
      nationalityCode,
    });
    const participant = {
      participantId: Faker.random.uuid(),
      participantType: INDIVIDUAL,
      participantRole: COMPETITOR,
      name,
      person: {
        addresses: [address],
        personId: Faker.random.uuid(),
        standardFamilyName,
        standardGivenName,
        nationalityCode,
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

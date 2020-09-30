import Faker from 'faker';
import { countries } from '../../fixtures/countryData';
import { generateRange, shuffleArray, randomMember } from '../../utilities';

import { COMPETITOR } from '../../constants/participantRoles';
import { INDIVIDUAL, PAIR, TEAM } from '../../constants/participantTypes';
import { DOUBLES } from '../../constants/matchUpTypes';

export function generateFakeParticipants({
  nationalityCodes,
  nationalityCodesCount,
  participantsCount = 32,
  addressProps,
  matchUpType,
  sex,
}) {
  const isoCountries = countries.filter(country => country.iso);
  const { citiesCount, statesCount, postalCodesCount } = addressProps || {};

  const cities =
    citiesCount &&
    generateRange(0, citiesCount).map(() => Faker.address.city());

  const states =
    statesCount &&
    generateRange(0, statesCount).map(() => Faker.address.state());

  const postalCodes =
    postalCodesCount &&
    generateRange(0, postalCodesCount).map(() => Faker.address.zipCode());

  const addressValues = { cities, states, postalCodes };

  const isoList = nationalityCodesCount
    ? shuffleArray(isoCountries).slice(0, nationalityCodesCount)
    : nationalityCodes
    ? isoCountries.filter(isoCountry =>
        nationalityCodes.includes(isoCountry.key)
      )
    : isoCountries;

  const countriesCount = isoList.length;
  const doubles = matchUpType === DOUBLES;
  const team = matchUpType === TEAM;

  const participants = generateRange(1, participantsCount + 1)
    .map(() => {
      const sideParticipantsCount = doubles ? 2 : team ? 8 : 1;
      const individualParticipants = generateRange(
        0,
        sideParticipantsCount
      ).map(() => generateIndividualParticipant());

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

  function generateIndividualParticipant() {
    const countryIndex = Faker.random.number({
      min: 0,
      max: countriesCount - 1,
    });
    const standardGivenName = Faker.name.firstName();
    const standardFamilyName = Faker.name.lastName();
    const name = `${standardFamilyName.toUpperCase()}, ${standardGivenName}`;
    const country = isoList[countryIndex];
    const nationalityCode = country && (country.ioc || country.iso);
    if (!nationalityCode) {
      console.log('%c Invalid Nationality Code', countryIndex, { country });
    }
    const address = generateAddress({ ...addressValues, nationalityCode });
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
  const { cities, states, postalCodes, nationalityCode } = addressAttributes;
  const address = {
    city: randomMember(cities),
    state: randomMember(states),
    postalCode: randomMember(postalCodes),
    countryCode: nationalityCode,
  };
  return address;
}

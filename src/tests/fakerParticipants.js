import Faker from 'faker';
import { generateRange } from '../utilities';
import { countries } from '../fixtures/countryData';
import { COMPETITOR } from '../constants/participantRoles';
import { INDIVIDUAL, PAIR, TEAM } from '../constants/participantTypes';

export function generateParticipants({ participantsCount = 32, matchUpType }) {
  const isoCountries = countries.filter(country => country.iso);
  const countriesCount = isoCountries.length;
  const doubles = matchUpType === 'DOUBLES';
  const team = matchUpType === 'TEAM';

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
    const country = isoCountries[countryIndex];
    const nationalityCode = country && (country.ioc || country.iso);
    if (!nationalityCode)
      console.log('%c Invalid Nationality Code', countryIndex, { country });
    const participant = {
      participantId: Faker.random.uuid(),
      participantType: INDIVIDUAL,
      participantRole: COMPETITOR,
      name,
      person: {
        personId: Faker.random.uuid(),
        standardFamilyName,
        standardGivenName,
        nationalityCode,
      },
    };
    return participant;
  }
}

import { countries } from '../../../fixtures/countryData';

export function annotatePerson(person) {
  const { nationalityCode } = person || {};
  if (nationalityCode) {
    const country = countries.find(({ iso }) => iso === nationalityCode);
    if (country?.ioc && !person.iocNationalityCode)
      person.iocNationalityCode = country.ioc;
    if (country?.label && !person.countryName)
      person.countryName = country.label;
  }
}

export function addNationalityCodeIOC({ participant }) {
  const { person, individualParticipants } = participant;
  const persons = [person, individualParticipants?.map(({ person }) => person)]
    .flat()
    .filter(Boolean);

  persons.forEach(annotatePerson);
}

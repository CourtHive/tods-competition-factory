import { countries } from '../../../fixtures/countryData';

export function annotatePerson(person) {
  const { nationalityCode } = person || {};
  if (nationalityCode) {
    const country = countries.find(({ ioc }) => ioc === nationalityCode);
    if (country?.iso && !person.isoNationalityCode)
      person.isoNationalityCode = country.iso;
    if (country?.label && !person.countryName)
      person.countryName = country.label;
  }
}

export function addNationalityCodeISO({ participant }) {
  const { person, individualParticipants } = participant;
  const persons = [person, individualParticipants?.map(({ person }) => person)]
    .flat()
    .filter(Boolean);

  persons.forEach(annotatePerson);
}

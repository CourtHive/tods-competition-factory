import { countries } from '../../../fixtures/countryData';

export function addNationalityCode({ participant, withISO2, withIOC }) {
  const { person, individualParticipants } = participant;
  const persons = [person, individualParticipants?.map(({ person }) => person)]
    .flat()
    .filter(Boolean);

  function annotatePerson(person) {
    const { nationalityCode } = person || {};
    if (nationalityCode) {
      const country = countries.find(({ iso }) => iso === nationalityCode);
      if (withIOC && country?.ioc && !person.iocNationalityCode)
        person.iocNationalityCode = country.ioc;
      if (withISO2 && country?.iso2 && !person.iso2NationalityCode)
        person.iso2NationalityCode = country.iso2;

      if (country?.label && !person.countryName)
        person.countryName = country.label;
    }
  }

  persons.forEach(annotatePerson);
}

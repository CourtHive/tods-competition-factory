import Faker from 'faker';

export function teamName() {
  return Faker.company.companyName();
}

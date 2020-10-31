import Faker from 'faker';

export function person() {
  const firstName = Faker.name.firstName();
  const lastName = Faker.name.lastName();
  return { firstName, lastName };
}

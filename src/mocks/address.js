import Faker from 'faker';

export function address() {
  return { city: city(), state: state(), postalCode: postalCode() };
}

export function city() {
  return Faker.address.city();
}

export function state() {
  return Faker.address.state();
}

export function postalCode() {
  return Faker.address.zipCode();
}

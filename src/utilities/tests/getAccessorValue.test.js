import { getAccessorValue } from '../getAccessorValue';
import { expect, it } from 'vitest';

const MAIN_STREET = 'Main Street';

it('can extract values from nested objects', () => {
  const element = {
    person: {
      name: 'Name',
      addresses: [
        { street: MAIN_STREET, city: 'New York' },
        { street: MAIN_STREET, city: 'San Francisco' },
      ],
    },
  };

  let { value, values } = getAccessorValue({
    element,
    accessor: 'person.name',
  });
  expect(value).toEqual('Name');
  expect(values).toEqual(['Name']);

  ({ value, values } = getAccessorValue({
    element,
    accessor: 'person.addresses.street',
  }));
  expect(value).toEqual(MAIN_STREET);
  expect(values).toEqual([MAIN_STREET]);

  ({ value, values } = getAccessorValue({
    element,
    accessor: 'person.addresses.city',
  }));
  expect(value).toEqual('New York');
  expect(values).toEqual(['New York', 'San Francisco']);
});

import { getAccessorValue } from '../getAccessorValue';

it('can extract values from nested objects', () => {
  const element = {
    person: {
      name: 'Name',
      addresses: [
        { street: 'Main Street', city: 'New York' },
        { street: 'Main Street', city: 'San Francisco' },
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
  expect(value).toEqual('Main Street');
  expect(values).toEqual(['Main Street']);

  ({ value, values } = getAccessorValue({
    element,
    accessor: 'person.addresses.city',
  }));
  expect(value).toEqual('New York');
  expect(values).toEqual(['New York', 'San Francisco']);
});

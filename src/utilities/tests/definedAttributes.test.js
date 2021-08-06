import { definedAttributes } from '../objects';

test('null empty or undefined attributes can be stripped out of JSON', () => {
  const example = {
    undefined: undefined,
    null: null,
    arrayWithUndefined: [1, undefined, 2, 3, undefined],
    arrayWithObjects: [{ undefined: undefined, 1: 'one', null: null }],
    defined: 'defined',
  };
  const cleaned = definedAttributes(example);
  expect(cleaned).toEqual({
    arrayWithUndefined: [1, undefined, 2, 3, undefined],
    arrayWithObjects: [{ 1: 'one' }],
    defined: 'defined',
  });
});

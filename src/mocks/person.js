import { shuffleArray } from '../utilities';
import personData from './persons.json';

export function personMocks({ count = 1, sex } = {}) {
  const shuffledPersons = shuffleArray(personData);

  const persons = shuffledPersons
    .filter((person) => !sex || person.sex === sex[0].toUpperCase())
    .slice(0, count);
  return { persons: (persons.length && persons) || shuffledPersons[0] };
}

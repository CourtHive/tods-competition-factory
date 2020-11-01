import { shuffleArray } from '../utilities';
import personData from './persons.json';

export function personMocks({ count = 1, sex } = {}) {
  const shuffledPersons = shuffleArray(personData);

  const persons = shuffledPersons
    .filter(person => !sex || person.sex === sex)
    .slice(0, count);
  return { persons };
}

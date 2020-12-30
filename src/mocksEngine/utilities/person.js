import { shuffleArray } from '../../utilities';
import personData from '../data/persons.json';

export function personMocks({ count = 1, sex } = {}) {
  const shuffledPersons = shuffleArray(personData);

  const persons = shuffledPersons
    .filter((person) => !sex || person.sex === sex[0].toUpperCase())
    .slice(0, count)
    .map((person, i) => {
      return Object.assign(person, {
        extensions: [{ name: 'regionCode', value: i + 1 }],
      });
    });
  return { persons: (persons.length && persons) || shuffledPersons[0] };
}

import { generateRange, shuffleArray } from '../../utilities';
import namesData from '../data/teams.json';

export function nameMocks({ nameRoot = 'TEAM', count = 1 } = {}) {
  const shuffledTeamNames = shuffleArray(namesData);
  const names = shuffledTeamNames.slice(0, count);
  if (names.length < count) {
    generateRange(0, count - names.length).forEach((i) =>
      names.push(`${nameRoot} ${i + 1}`)
    );
  }
  return { names };
}

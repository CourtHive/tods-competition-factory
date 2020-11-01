import { shuffleArray } from '../utilities';
import teamsData from './teams.json';

export function teamMocks({ count = 1 } = {}) {
  const shuffledCities = shuffleArray(teamsData);
  const teams = shuffledCities.slice(0, count);
  return { teams };
}

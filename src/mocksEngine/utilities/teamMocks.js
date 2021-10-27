import { generateRange, shuffleArray } from '../../utilities';
import teamsData from '../data/teams.json';

export function teamMocks({ count = 1 } = {}) {
  const shuffledTeamNames = shuffleArray(teamsData);
  const teams = shuffledTeamNames.slice(0, count);
  if (teams.length < count) {
    generateRange(0, count - teams.length).forEach((i) =>
      teams.push(`Team ${i + 1}`)
    );
  }
  return { teams };
}

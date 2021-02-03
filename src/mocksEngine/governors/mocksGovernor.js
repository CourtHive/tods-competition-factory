import { generateOutcomeFromScoreString } from '../generators/generateOutcomeFromScoreString';
import { generateParticipants } from '../generators/generateParticipants';
import { generateTournamentRecord } from '../generators/generateTournamentRecord';
import { matchUpSort } from '../utilities/matchUpSort';

const mocksGovernor = {
  matchUpSort,
  generateParticipants,
  generateTournamentRecord,
  generateOutcomeFromScoreString,
};

export default mocksGovernor;

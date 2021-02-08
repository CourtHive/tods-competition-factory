import { generateOutcomeFromScoreString } from '../generators/generateOutcomeFromScoreString';
import { generateParticipants } from '../generators/generateParticipants';
import { generateTournamentRecord } from '../generators/generateTournamentRecord';

const mocksGovernor = {
  generateParticipants,
  generateTournamentRecord,
  generateOutcomeFromScoreString,
};

export default mocksGovernor;

import { generateOutcomeFromScoreString } from '../generators/generateOutcomeFromScoreString';
import { generateTournamentRecord } from '../generators/generateTournamentRecord';
import { generateParticipants } from '../generators/generateParticipants';

import { parseScoreString } from '../utilities/parseScoreString';

const mocksGovernor = {
  generateParticipants,
  generateTournamentRecord,
  generateOutcomeFromScoreString,

  parseScoreString,
};

export default mocksGovernor;

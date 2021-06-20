import { generateOutcomeFromScoreString } from '../generators/generateOutcomeFromScoreString';
import { generateTournamentRecord } from '../generators/generateTournamentRecord';
import { generateParticipants } from '../generators/generateParticipants';
import { parseScoreString } from '../utilities/parseScoreString';
import { credits } from '../../fixtures/credits';

const mocksGovernor = {
  generateParticipants,
  generateTournamentRecord,
  generateOutcomeFromScoreString,

  parseScoreString,
  credits,
};

export default mocksGovernor;

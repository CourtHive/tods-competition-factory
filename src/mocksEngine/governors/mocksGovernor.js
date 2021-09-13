import { generateOutcomeFromScoreString } from '../generators/generateOutcomeFromScoreString';
import { generateTournamentRecord } from '../generators/generateTournamentRecord';
import { generateEventWithDraw } from '../generators/generateEventWithDraw';
import { generateParticipants } from '../generators/generateParticipants';
import { parseScoreString } from '../utilities/parseScoreString';
import { generateOutcome } from '../generators/generateOutcome';
import { credits } from '../../fixtures/credits';

const mocksGovernor = {
  generateTournamentRecord,
  generateParticipants,
  generateEventWithDraw,

  generateOutcomeFromScoreString,
  generateOutcome,

  parseScoreString,
  credits,
};

export default mocksGovernor;

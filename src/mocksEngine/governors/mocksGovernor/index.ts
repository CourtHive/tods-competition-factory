import { generateOutcomeFromScoreString } from '../../generators/generateOutcomeFromScoreString';
import { generateTournamentRecord } from '../../generators/generateTournamentRecord';
import { generateEventWithDraw } from '../../generators/generateEventWithDraw';
import { generateParticipants } from '../../generators/generateParticipants';
import { completeDrawMatchUps } from '../../generators/completeDrawMatchUps';
import { parseScoreString } from '../../utilities/parseScoreString';
import { generateOutcome } from '../../generators/generateOutcome';
import { credits } from '../../../fixtures/credits';

const mocksGovernor = {
  generateOutcomeFromScoreString,
  generateTournamentRecord,
  generateEventWithDraw,
  completeDrawMatchUps,
  generateParticipants,
  parseScoreString,
  generateOutcome,
  credits,
};

export default mocksGovernor;

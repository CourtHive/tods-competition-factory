import { anonymizeTournamentRecord } from '../../generators/tournamentRecords/anonymizeTournamentRecord';
import { generateOutcomeFromScoreString } from '../../generators/mocks/generateOutcomeFromScoreString';
import { generateTournamentRecord } from '../../generators/mocks/generateTournamentRecord';
import { modifyTournamentRecord } from '../../generators/mocks/modifyTournamentRecord';
import { generateEventWithDraw } from '../../generators/mocks/generateEventWithDraw';
import { generateParticipants } from '../../generators/mocks/generateParticipants';
import { generateOutcome } from '../../generators/mocks/generateOutcome';
import { parseScoreString } from '../../../utilities/parseScoreString';
import { credits } from '../../../fixtures/credits';

const mocksGovernor = {
  generateOutcomeFromScoreString,
  anonymizeTournamentRecord,
  generateTournamentRecord,
  modifyTournamentRecord,
  generateEventWithDraw,
  generateParticipants,
  parseScoreString,
  generateOutcome,
  credits,
};

export default mocksGovernor;

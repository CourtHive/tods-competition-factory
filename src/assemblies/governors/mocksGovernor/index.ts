import { anonymizeTournamentRecord } from '../../generators/tournamentRecords/anonymizeTournamentRecord';
import { generateOutcomeFromScoreString } from '../../generators/mocks/generateOutcomeFromScoreString';
import { generateTournamentRecord } from '../../generators/mocks/generateTournamentRecord';
import { modifyTournamentRecord } from '../../generators/mocks/modifyTournamentRecord';
import { generateEventWithDraw } from '../../generators/mocks/generateEventWithDraw';
import { generateParticipants } from '../../generators/mocks/generateParticipants';
import { generateOutcome } from '../../generators/mocks/generateOutcome';

export const mocksGovernor = {
  anonymizeTournamentRecord,
  generateEventWithDraw,
  generateOutcome,
  generateOutcomeFromScoreString,
  generateParticipants,
  generateTournamentRecord,
  modifyTournamentRecord,
};

export default mocksGovernor;

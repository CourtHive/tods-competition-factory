import participantGovernor from '../../../tournamentEngine/governors/participantGovernor';
import publishingGovernor from '../../../tournamentEngine/governors/publishingGovernor';
import tournamentGovernor from '../../../tournamentEngine/governors/tournamentGovernor';
import scheduleGovernor from '../../../tournamentEngine/governors/scheduleGovernor';
import reportGovernor from '../../../tournamentEngine/governors/reportGovernor';
import eventGovernor from '../../../tournamentEngine/governors/eventGovernor';
import queryGovernor from '../../../tournamentEngine/governors/queryGovernor';
import venueGovernor from '../../../tournamentEngine/governors/venueGovernor';

import policyGovernor from '../../../assemblies/governors/policyGovernor';

import syncEngine from '../../../assemblies/engines/sync';

const methods = {
  ...participantGovernor,
  ...publishingGovernor,
  ...tournamentGovernor,
  ...scheduleGovernor,
  ...policyGovernor,
  ...reportGovernor,
  ...eventGovernor,
  ...queryGovernor,
  ...venueGovernor,
};

syncEngine.importMethods(methods);

export const tournamentEngine = syncEngine;
export default syncEngine;

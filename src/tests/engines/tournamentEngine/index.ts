import participantGovernor from '../../../assemblies/governors/participantGovernor';
import publishingGovernor from '../../../assemblies/governors/publishingGovernor';
import scheduleGovernor from '../../../assemblies/governors/scheduleGovernor';
import reportGovernor from '../../../assemblies/governors/reportGovernor';
import venueGovernor from '../../../assemblies/governors/venueGovernor';

import tournamentGovernor from '../../../assemblies/governors/tournamentGovernor';
import policyGovernor from '../../../assemblies/governors/policyGovernor';
import queryGovernor from '../../../assemblies/governors/queryGovernor';
import eventGovernor from '../../../assemblies/governors/eventGovernor';

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

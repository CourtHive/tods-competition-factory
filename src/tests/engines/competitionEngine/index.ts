import competitionGovernor from '../../../competitionEngine/governors/competitionsGovernor';
import venueGovernor from '../../../competitionEngine/governors/venueGovernor';

import publishingGovernor from '../../../assemblies/governors/publishingGovernor';
import scheduleGovernor from '../../../assemblies/governors/scheduleGovernor';
import policyGovernor from '../../../assemblies/governors/policyGovernor';
import queryGovernor from '../../../assemblies/governors/queryGovernor';

import syncEngine from '../../../assemblies/engines/sync';

const methods = {
  ...competitionGovernor,
  ...publishingGovernor,
  ...scheduleGovernor,
  ...policyGovernor,
  ...queryGovernor,
  ...venueGovernor,
};

syncEngine.importMethods(methods);

export const competitionEngine = syncEngine;

export default syncEngine;

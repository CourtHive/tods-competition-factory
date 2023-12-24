import competitionGovernor from '../../../competitionEngine/governors/competitionsGovernor';
import publishingGovernor from '../../../competitionEngine/governors/publishingGovernor';
import scheduleGovernor from '../../../competitionEngine/governors/scheduleGovernor';
import policyGovernor from '../../../assemblies/governors/policyGovernor';
import queryGovernor from '../../../assemblies/governors/queryGovernor';
import venueGovernor from '../../../competitionEngine/governors/venueGovernor';
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

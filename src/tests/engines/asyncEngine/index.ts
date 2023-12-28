import competitionsGovernor from '../../../assemblies/governors/competitionsGovernor';
import participantGovernor from '../../../assemblies/governors/participantGovernor';
import generationGovernor from '../../../assemblies/governors/generationGovernor';
import publishingGovernor from '../../../assemblies/governors/publishingGovernor';
import scheduleGovernor from '../../../assemblies/governors/scheduleGovernor';
import reportGovernor from '../../../assemblies/governors/reportGovernor';
import venueGovernor from '../../../assemblies/governors/venueGovernor';

import tournamentGovernor from '../../../assemblies/governors/tournamentGovernor';
import policyGovernor from '../../../assemblies/governors/policyGovernor';
import queryGovernor from '../../../assemblies/governors/queryGovernor';
import eventGovernor from '../../../assemblies/governors/eventGovernor';

import async from '../../../assemblies/engines/async';
const asyncEngine = async(true);

const methods = {
  ...competitionsGovernor,
  ...participantGovernor,
  ...generationGovernor,
  ...publishingGovernor,
  ...tournamentGovernor,
  ...scheduleGovernor,
  ...policyGovernor,
  ...reportGovernor,
  ...eventGovernor,
  ...queryGovernor,
  ...venueGovernor,
};

asyncEngine.importMethods(methods);

export const competitionEngineAsync = asyncEngine;
export const tournamentEngineAsync = asyncEngine;
export default asyncEngine;

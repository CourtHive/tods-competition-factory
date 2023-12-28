import competitionsGovernor from '../../../assemblies/governors/competitionsGovernor';
import participantGovernor from '../../../assemblies/governors/participantGovernor';
import generationGovernor from '../../../assemblies/governors/generationGovernor';
import publishingGovernor from '../../../assemblies/governors/publishingGovernor';
import scheduleGovernor from '../../../assemblies/governors/scheduleGovernor';
import reportGovernor from '../../../assemblies/governors/reportGovernor';
import scoreGovernor from '../../../assemblies/governors/scoreGovernor';
import venueGovernor from '../../../assemblies/governors/venueGovernor';

import tournamentGovernor from '../../../assemblies/governors/tournamentGovernor';
import policyGovernor from '../../../assemblies/governors/policyGovernor';
import queryGovernor from '../../../assemblies/governors/queryGovernor';
import eventGovernor from '../../../assemblies/governors/eventGovernor';

import syncEngine from '../../../assemblies/engines/sync';

const methods = {
  ...competitionsGovernor,
  ...participantGovernor,
  ...publishingGovernor,
  ...generationGovernor,
  ...tournamentGovernor,
  ...scheduleGovernor,
  ...policyGovernor,
  ...reportGovernor,
  ...eventGovernor,
  ...queryGovernor,
  ...scoreGovernor,
  ...venueGovernor,
};

syncEngine.importMethods(methods);

export const competitionEngine = syncEngine;
export const tournamentEngine = syncEngine;
export default syncEngine;

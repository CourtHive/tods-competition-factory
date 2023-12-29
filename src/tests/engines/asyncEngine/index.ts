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

/**
// NOTE: This is an example of how to use asyncEngine with asyncGlobalState
// IMPORTANT: This will not work with vitest because vitest does not support async
import asyncGlobalState from '../../../examples/asyncEngine/asyncGlobalState';
import { setStateProvider } from '../../../global/state/globalState';
setStateProvider(asyncGlobalState);
 */

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
  ...scoreGovernor,
  ...venueGovernor,
};

asyncEngine.importMethods(methods);

export const competitionEngineAsync = asyncEngine;
export const tournamentEngineAsync = asyncEngine;
export default asyncEngine;

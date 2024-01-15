import { governors } from '../../../assemblies/governors';
import async from '../../../assemblies/engines/async';

/**
// NOTE: This is an example of how to use asyncEngine with asyncGlobalState
// IMPORTANT: This will not work with vitest because vitest does not support async
import asyncGlobalState from '../../../examples/asyncEngine/asyncGlobalState';
import { setStateProvider } from '../../../global/state/globalState';
setStateProvider(asyncGlobalState);
 */

const asyncEngine = async(true);

const methods = {
  ...governors.competitionGovernor,
  ...governors.participantGovernor,
  ...governors.generationGovernor,
  ...governors.publishingGovernor,
  ...governors.tournamentGovernor,
  ...governors.tieFormatGovernor,
  ...governors.scheduleGovernor,
  ...governors.entriesGovernor,
  ...governors.matchUpGovernor,
  ...governors.policyGovernor,
  ...governors.reportGovernor,
  ...governors.eventGovernor,
  ...governors.drawsGovernor,
  ...governors.queryGovernor,
  ...governors.scoreGovernor,
  ...governors.venueGovernor,
};

asyncEngine.importMethods(methods);

export const competitionEngineAsync = asyncEngine;
export const tournamentEngineAsync = asyncEngine;
export default asyncEngine;

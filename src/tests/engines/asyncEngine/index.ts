import * as governors from '@Assemblies/governors';
import async from '@Assemblies/engines/async';

/**
// NOTE: This is an example of how to use asyncEngine with asyncGlobalState
// IMPORTANT: This will not work with vitest because vitest does not support async
import asyncGlobalState from '../../../examples/asyncEngine/asyncGlobalState';
import { setStateProvider } from '@Global/state/globalState';
setStateProvider(asyncGlobalState);
 */

const asyncEngine = async(true);
asyncEngine.importMethods(governors, true, 1);

export const competitionEngineAsync = asyncEngine;
export const tournamentEngineAsync = asyncEngine;
export default asyncEngine;

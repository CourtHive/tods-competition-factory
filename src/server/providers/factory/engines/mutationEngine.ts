import { asyncEngine, globalState } from '../../../..';
import * as governors from '@Assemblies/governors';
import asyncGlobalState from './asyncGlobalState';

globalState.setStateProvider(asyncGlobalState);
asyncGlobalState.createInstanceState();

export function getMutationEngine() {
  const engineAsync = asyncEngine();
  engineAsync.importMethods(governors, true, 1);
  globalState.setSubscriptions({ subscriptions: {} });

  return engineAsync;
}

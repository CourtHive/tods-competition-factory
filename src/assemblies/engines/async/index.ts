import { createInstanceState } from '../../../global/state/globalState';
import { asyncExecutionQueue } from './asyncExecutionQueue';
import { asyncEngineInvoke } from './asyncEngineInvoke';
import { engineStart } from '../parts/engineStart';

import { FactoryEngine } from '../../../types/factoryTypes';

type MethodParams = {
  params?: { [key: string]: any };
  method: string;
};

export function asyncEngine(test?: boolean): FactoryEngine & { error?: any } {
  const result = createInstanceState();
  if (result.error && !test) return result;

  const engine: FactoryEngine = {
    executionQueue: (directives: MethodParams[], rollbackOnError?: boolean) =>
      asyncExecutionQueue(engine, directives, rollbackOnError),
    execute: (args: any) => asyncEngineInvoke(engine, args),
  };

  engineStart(engine, asyncEngineInvoke);

  return engine;
}

export default asyncEngine;

import { FactoryEngine } from '../../../types/factoryTypes';
import { asyncExecutionQueue } from './asyncExecutionQueue';
import { asyncEngineInvoke } from './asyncEngineInvoke';
import { engineStart } from '../engineStart';

type MethodParams = {
  params?: { [key: string]: any };
  method: string;
};

export const engine = (() => {
  const engine: FactoryEngine = {
    executionQueue: (directives: MethodParams[], rollbackOnError?: boolean) =>
      asyncExecutionQueue(engine, directives, rollbackOnError),
    execute: (args: any) => asyncEngineInvoke(engine, args),
  };

  engineStart(engine);

  return engine;
})();

export default engine;

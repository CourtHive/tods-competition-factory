import { engineStart } from '../parts/engineStart';
import { executionQueue } from './executionQueue';
import { engineInvoke } from './engineInvoke';

import { FactoryEngine } from '../../../types/factoryTypes';

type MethodParams = {
  params?: { [key: string]: any };
  method: string;
};

export const engine = ((): FactoryEngine => {
  const engine: FactoryEngine = {
    executionQueue: (directives: MethodParams[], rollbackOnError?: boolean) =>
      executionQueue(engine, directives, rollbackOnError),
    execute: (args: any) => engineInvoke(engine, args),
  };

  engineStart(engine, engineInvoke);

  return engine;
})();

export default engine;

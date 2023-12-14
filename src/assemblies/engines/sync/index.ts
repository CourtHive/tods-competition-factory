import { executionQueue } from './executionQueue';
import { engineInvoke } from './engineInvoke';

import { FactoryEngine } from '../../../types/factoryTypes';
import { engineStart } from '../engineStart';

type MethodParams = {
  params?: { [key: string]: any };
  method: string;
};

export const engine = (() => {
  const engine: FactoryEngine = {
    executionQueue: (directives: MethodParams[], rollbackOnError?: boolean) =>
      executionQueue(engine, directives, rollbackOnError),
    execute: (args: any) => engineInvoke(engine, args),
  };

  engineStart(engine, engineInvoke);

  return engine;
})();

export default engine;

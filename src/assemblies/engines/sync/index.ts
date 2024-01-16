import { engineStart } from '../parts/engineStart';
import { executionQueue } from './executionQueue';
import { engineInvoke } from './engineInvoke';

import { Directives, FactoryEngine } from '../../../types/factoryTypes';

export const syncEngine = ((): FactoryEngine => {
  const engine: FactoryEngine = {
    executionQueue: (directives: Directives, rollbackOnError?: boolean) =>
      executionQueue(engine, directives, rollbackOnError),
    execute: (args: any) => engineInvoke(engine, args),
  };

  engineStart(engine, engineInvoke);

  return engine;
})();

export default syncEngine;

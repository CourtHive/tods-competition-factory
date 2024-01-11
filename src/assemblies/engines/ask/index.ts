import { askInvoke } from './askInvoke';

import { FactoryEngine } from '../../../types/factoryTypes';
import { engineStart } from '../parts/engineStart';

export const askEngine = (() => {
  const engine: FactoryEngine = {
    execute: (args: any) => askInvoke(engine, args),
  };

  engineStart(engine, askInvoke);

  return engine;
})();

export default askEngine;

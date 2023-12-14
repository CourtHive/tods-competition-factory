import { askInvoke } from './askInvoke';

import { FactoryEngine } from '../../../types/factoryTypes';
import { engineStart } from '../engineStart';

export const engine = (() => {
  const engine: FactoryEngine = {
    execute: (args: any) => askInvoke(engine, args),
  };

  engineStart(engine);

  return engine;
})();

export default engine;

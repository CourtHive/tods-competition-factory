import { factoryVersion } from '../../global/functions/factoryVersion';
import { executionQueue } from './executionQueue';
import { processResult } from './processResult';
import { engineInvoke } from './engineInvoke';
import {
  setDeepCopy,
  setDevContext,
  getDevContext,
  removeTournamentRecord,
  setTournamentRecords,
} from '../../global/state/globalState';
import {
  getState,
  getTournament,
  removeUnlinkedTournamentRecords,
  setState,
  setTournamentRecord,
} from './stateMethods';

import { FactoryEngine } from '../../types/factoryTypes';

type MethodParams = {
  params?: { [key: string]: any };
  method: string;
};

export const engine = (() => {
  const engine: FactoryEngine = {
    getState: (params?) =>
      getState({
        convertExtensions: params?.convertExtensions,
        removeExtensions: params?.removeExtensions,
      }),
    getTournament: getTournament,
    version: factoryVersion,

    execute: (args: any) => engineInvoke(engine, args),
    executionQueue: (directives: MethodParams[], rollbackOnError?: boolean) =>
      executionQueue(engine, directives, rollbackOnError),
  };

  engine.reset = () => {
    setTournamentRecords({});
    return processResult(engine);
  };

  engine.devContext = (contextCriteria) => {
    setDevContext(contextCriteria);
    return processResult(engine);
  };
  engine.getDevContext = (contextCriteria) => getDevContext(contextCriteria);
  engine.setState = (records, deepCopyOption, deepCopyAttributes) => {
    setDeepCopy(deepCopyOption, deepCopyAttributes);
    const result = setState(records, deepCopyOption);
    return processResult(engine, result);
  };
  engine.setTournamentRecord = (
    tournamentRecord,
    deepCopyOption,
    deepCopyAttributes
  ) => {
    setDeepCopy(deepCopyOption, deepCopyAttributes);
    const result = setTournamentRecord(tournamentRecord, deepCopyOption);
    return processResult(engine, result);
  };
  engine.removeTournamentRecord = (tournamentId) => {
    const result = removeTournamentRecord(tournamentId);
    return processResult(engine, result);
  };
  engine.removeUnlinkedTournamentRecords = () => {
    const result = removeUnlinkedTournamentRecords();
    return processResult(engine, result);
  };

  return engine;
})();

export default engine;

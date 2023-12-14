import { factoryVersion } from '../../global/functions/factoryVersion';
import { importMethods } from './importMethods';
import { processResult } from './processResult';
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

export function engineStart(engine: FactoryEngine, engineInvoke: any): void {
  engine.importMethods = (methods) =>
    importMethods(engine, engineInvoke, methods);
  engine.getTournament = (params?) => getTournament(params);
  engine.getState = (params?) =>
    getState({
      convertExtensions: params?.convertExtensions,
      removeExtensions: params?.removeExtensions,
    });
  engine.version = () => factoryVersion();
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
}

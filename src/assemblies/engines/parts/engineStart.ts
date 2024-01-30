/**
 * Starts the engine by initializing its methods and properties.
 * @param engine - The FactoryEngine object.
 * @param engineInvoke - The engineInvoke object.
 */

import { newTournamentRecord } from '@Assemblies/generators/tournamentRecords/newTournamentRecord';
import { importMethods } from '@Assemblies/engines/parts/importMethods';
import { processResult } from '@Assemblies/engines/parts/processResult';
import { factoryVersion } from '@Functions/global/factoryVersion';
import {
  setDeepCopy,
  setDevContext,
  getDevContext,
  removeTournamentRecord,
  setTournamentRecords,
  setTournamentId,
  getTournamentId,
} from '@Global/state/globalState';
import {
  getState,
  getTournament,
  removeUnlinkedTournamentRecords,
  setState,
  setTournamentRecord,
} from '@Assemblies/engines/parts/stateMethods';

// constants and types
import { SUCCESS } from '@Constants/resultConstants';
import { FactoryEngine } from '@Types/factoryTypes';

export function engineStart(engine: FactoryEngine, engineInvoke: any): void {
  engine.importMethods = (methods, collections, depth) =>
    importMethods(engine, engineInvoke, methods, collections, depth);
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
  engine.newTournamentRecord = (params = {}) => {
    const result = newTournamentRecord(params);
    const tournamentId = result.tournamentId;
    if (result.error) return result;
    setTournamentRecord(result);
    setTournamentId(tournamentId);
    return { ...SUCCESS, tournamentId };
  };
  engine.setState = (records, deepCopyOption, deepCopyAttributes) => {
    setDeepCopy(deepCopyOption, deepCopyAttributes);
    const result = setState(records, deepCopyOption);
    return processResult(engine, result);
  };
  engine.setTournamentId = (tournamentId) => setTournamentId(tournamentId);
  engine.getTournamentId = () => getTournamentId();
  engine.setTournamentRecord = (tournamentRecord, deepCopyOption, deepCopyAttributes) => {
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

import { updateFactoryExtension } from '../../tournamentEngine/governors/tournamentGovernor/updateFactoryExtension';
import { notifySubscribers } from '../../global/state/notifySubscribers';
import { factoryVersion } from '../../global/functions/factoryVersion';
import { executeFunction } from './executeFunction';
import { isFunction, isObject } from '../../utilities/objects';
import { makeDeepCopy } from '../../utilities';
import { setState } from './stateMethods';
import {
  deleteNotices,
  getTournamentRecords,
  getTournamentId,
  cycleMutationStatus,
} from '../../global/state/globalState';

import { INVALID_VALUES } from '../../constants/errorConditionConstants';

export function engineInvoke(engine: { [key: string]: any }, args: any) {
  if (!isObject(args)) return { error: INVALID_VALUES };
  const methodsCount = Object.values(args).filter(isFunction).length;
  if (methodsCount !== 1) return { error: INVALID_VALUES };
  const methodName = Object.keys(args).find((key) => isFunction(args[key]));
  if (!methodName) return { error: INVALID_VALUES };

  const { [methodName]: method, ...remainingArgs } = args;
  const params = args?.params || { ...remainingArgs };

  const tournamentRecords = getTournamentRecords();
  const activeTournamentId = getTournamentId();

  const snapshot =
    params.rollbackOnError && makeDeepCopy(tournamentRecords, false, true);

  const result = executeFunction(
    engine,
    tournamentRecords,
    method,
    { activeTournamentId, ...params },
    methodName
  );

  if (result?.error && snapshot) setState(snapshot);

  const notify =
    result?.success &&
    params?.delayNotify !== true &&
    params?.doNotNotify !== true;
  const mutationStatus = cycleMutationStatus();
  const timeStamp = Date.now();
  if (mutationStatus) {
    Object.values(tournamentRecords).forEach((tournamentRecord) => {
      updateFactoryExtension({
        tournamentRecord,
        value: {
          version: factoryVersion(),
          timeStamp,
        },
      });
    });
    result.modificationsApplied = true;
  }
  if (notify)
    notifySubscribers({
      directives: [{ method, params }],
      mutationStatus,
      timeStamp,
    });
  if (notify || !result?.success || params?.doNotNotify) deleteNotices();

  return result;
}

import { notifySubscribers } from '../global/notifySubscribers';
import scheduleGovernor from './governors/scheduleGovernor';
import queryGovernor from './governors/queryGovernor';
import { makeDeepCopy } from '../utilities';
import {
  setSubscriptions,
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
} from '../global/globalState';

import {
  INVALID_OBJECT,
  INVALID_RECORDS,
  INVALID_VALUES,
} from '../constants/errorConditionConstants';
import { SUCCESS } from '../constants/resultConstants';

let tournamentRecords = {};

function setTournamentRecord(record, deepCopyOption = true) {
  if (typeof record !== 'object') return { error: INVALID_OBJECT };
  if (!record.tournamentId) return { error: INVALID_VALUES };
  const tournamentRecord = deepCopyOption ? makeDeepCopy(record) : record;

  tournamentRecords[record.tournamentId] = tournamentRecord;
  return SUCCESS;
}

function setState(records, deepCopyOption = true) {
  if (typeof records !== 'object') return { error: INVALID_OBJECT };

  if (Array.isArray(records)) {
    const validRecordsArray =
      records.filter(({ tournamentId }) => tournamentId).length ===
      records.length;
    if (!validRecordsArray) return { error: INVALID_RECORDS };
    records = Object.assign(
      {},
      ...records.map((record) => ({ [record.tournamentId]: record }))
    );
  }

  tournamentRecords = deepCopyOption ? makeDeepCopy(records) : records;

  return SUCCESS;
}

export const competitionEngine = (function () {
  const fx = {
    getState: ({ convertExtensions } = {}) => ({
      tournamentRecords: makeDeepCopy(tournamentRecords, convertExtensions),
    }),
    setSubscriptions: (subscriptions) => {
      if (typeof subscriptions === 'object')
        setSubscriptions({ subscriptions });
      return fx;
    },
  };

  importGovernors([queryGovernor, scheduleGovernor]);

  fx.version = () => {
    return '@VERSION@';
  };
  fx.devContext = (isDev) => {
    setDevContext(isDev);
    return fx;
  };
  fx.setState = (tournamentRecords, deepCopyOption) => {
    setDeepCopy(deepCopyOption);
    const result = setState(tournamentRecords, deepCopyOption);
    if (result?.error) {
      fx.error = result.error;
      fx.success = false;
    } else {
      fx.error = undefined;
      fx.success = true;
    }
    return fx;
  };
  fx.setTournamentRecord = (tournamentRecord, deepCopyOption) => {
    setDeepCopy(deepCopyOption);
    const result = setTournamentRecord(tournamentRecord, deepCopyOption);
    if (result?.error) {
      fx.error = result.error;
      fx.success = false;
    } else {
      fx.error = undefined;
      fx.success = true;
    }
    return fx;
  };

  return fx;

  // enable Middleware
  function engineInvoke(fx, params) {
    const result = fx({
      ...params,
      tournamentRecords,
    });

    if (result?.success) {
      notifySubscribers();
    }
    deleteNotices();

    return result;
  }

  function importGovernors(governors) {
    governors.forEach((governor) => {
      Object.keys(governor).forEach((key) => {
        fx[key] = (params) => {
          if (getDevContext()) {
            return engineInvoke(governor[key], params);
          } else {
            try {
              return engineInvoke(governor[key], params);
            } catch (err) {
              console.log('%c ERROR', 'color: orange', { err });
            }
          }
        };
      });
    });
  }
})();

export default competitionEngine;

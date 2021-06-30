import { newTournamentRecord } from './generators/newTournamentRecord';
import { notifySubscribersAsync } from '../global/notifySubscribers';
import participantGovernor from './governors/participantGovernor';
import publishingGovernor from './governors/publishingGovernor';
import tournamentGovernor from './governors/tournamentGovernor';
import scheduleGovernor from './governors/scheduleGovernor';
import { createInstanceState } from '../global/globalState';
import { factoryVersion } from '../global/factoryVersion';
import policyGovernor from './governors/policyGovernor';
import eventGovernor from './governors/eventGovernor';
import queryGovernor from './governors/queryGovernor';
import venueGovernor from './governors/venueGovernor';
import { setState, getState } from './stateMethods';
import { findEvent } from './getters/eventGetter';
import { makeDeepCopy } from '../utilities';
import {
  deleteNotices,
  setDeepCopy,
  setDevContext,
  getDevContext,
  getTournamentRecord,
  removeTournamentRecord,
  setTournamentRecord,
} from '../global/globalState';

import { SUCCESS } from '../constants/resultConstants';

export function tournamentEngineAsync(test) {
  const result = createInstanceState();
  if (result.error && !test) return result;

  let tournamentId;

  const fx = {
    getState: ({ convertExtensions } = {}) =>
      getState({ convertExtensions, tournamentId }),
    newTournamentRecord: (props = {}) => {
      const result = newTournamentRecord(props);
      if (result.error) return result;
      setTournamentRecord(result);
      tournamentId = result.tournamentId;
      return Object.assign({ tournamentId }, SUCCESS);
    },
    setTournamentId: (newTournamentId) => {
      // TODO: add globalState method to insure that tournamentRecords[tournamentId] is valid
      tournamentId = newTournamentId;
      return SUCCESS;
    },
  };

  fx.version = () => factoryVersion();
  fx.reset = () => {
    removeTournamentRecord(tournamentId);
    tournamentId = undefined;
    return SUCCESS;
  };
  fx.setState = (tournament, deepCopyOption) => {
    setDeepCopy(deepCopyOption);
    const result = setState(tournament, deepCopyOption);
    return processResult(result);
  };
  fx.devContext = (isDev) => {
    setDevContext(isDev);
    return fx;
  };

  function processResult(result) {
    if (result?.error) {
      fx.error = result.error;
      fx.success = false;
    } else {
      fx.error = undefined;
      fx.success = true;
      tournamentId = result.tournamentId;
    }
    return fx;
  }

  importGovernors([
    queryGovernor,
    eventGovernor,
    venueGovernor,
    policyGovernor,
    scheduleGovernor,
    publishingGovernor,
    tournamentGovernor,
    participantGovernor,
  ]);

  return fx;

  // enable Middleware
  async function engineInvoke(fx, params) {
    const tournamentRecord = getTournamentRecord(tournamentId);

    const snapshot =
      params?.rollBackOnError && makeDeepCopy(tournamentRecord, false, true);

    if (params) {
      const { drawId } = params || (params.matchUp && params.matchUp.drawId);

      if (drawId) {
        const { event, drawDefinition } = findEvent({
          tournamentRecord,
          drawId,
        });
        params = Object.assign({}, params, { event, drawDefinition });
      }
      if (params.eventId && !params.event) {
        const { event } = findEvent({
          tournamentRecord,
          eventId: params.eventId,
        });
        if (event) {
          params = Object.assign({}, params, { event });
        }
      }
    }

    const result = await fx({
      ...params,
      tournamentRecord,
    });

    if (result.error && snapshot) setState(snapshot);

    const notify = result?.success && !params?.delayNotify;
    if (notify) await notifySubscribersAsync();
    if (notify || !result?.success) deleteNotices();

    return result;
  }

  function importGovernors(governors) {
    for (const governor of governors) {
      const governorMethods = Object.keys(governor);

      for (const governorMethod of governorMethods) {
        fx[governorMethod] = async (params) => {
          if (getDevContext()) {
            const result = await engineInvoke(
              governor[governorMethod],
              params,
              governorMethod
            );

            return result;
          } else {
            const result = await engineInvoke(
              governor[governorMethod],
              params,
              governorMethod
            );

            return result;
          }
        };
      }
    }
  }
}

export default tournamentEngineAsync;

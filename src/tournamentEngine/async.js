import { newTournamentRecord } from './generators/newTournamentRecord';
import { notifySubscribersAsync } from '../global/notifySubscribers';
import participantGovernor from './governors/participantGovernor';
import publishingGovernor from './governors/publishingGovernor';
import tournamentGovernor from './governors/tournamentGovernor';
import scheduleGovernor from './governors/scheduleGovernor';
import { createInstanceState } from '../global/globalState';
import policyGovernor from './governors/policyGovernor';
import eventGovernor from './governors/eventGovernor';
import queryGovernor from './governors/queryGovernor';
import venueGovernor from './governors/venueGovernor';
import { findEvent } from './getters/eventGetter';
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
  MISSING_TOURNAMENT_ID,
} from '../constants/errorConditionConstants';
import { SUCCESS } from '../constants/resultConstants';

export function tournamentEngineAsync() {
  createInstanceState();

  let tournamentRecord;

  function setState(tournament, deepCopyOption) {
    if (typeof tournament !== 'object') return { error: INVALID_OBJECT };
    const tournamentId =
      tournament.unifiedTournamentId?.tournamentId || tournament.tournamentId;
    if (!tournamentId) return { error: MISSING_TOURNAMENT_ID };
    tournamentRecord =
      deepCopyOption !== false ? makeDeepCopy(tournament) : tournament;

    return Object.assign({ tournamentId }, SUCCESS);
  }

  const fx = {
    getState: ({ convertExtensions } = {}) => ({
      tournamentRecord: makeDeepCopy(tournamentRecord, convertExtensions),
    }),
    setSubscriptions: (subscriptions) => {
      if (typeof subscriptions === 'object')
        setSubscriptions({ subscriptions });
      return fx;
    },
    newTournamentRecord: (props = {}) => {
      const result = newTournamentRecord(props);
      if (result.error) return result;
      tournamentRecord = result;
      const tournamentId = tournamentRecord.tournamentId;
      return Object.assign({ tournamentId }, SUCCESS);
    },
  };

  fx.version = () => {
    return '@VERSION@';
  };
  fx.reset = () => {
    tournamentRecord = undefined;
    return SUCCESS;
  };
  fx.setState = (tournament, deepCopyOption) => {
    setDeepCopy(deepCopyOption);
    const result = setState(tournament, deepCopyOption);
    if (result?.error) {
      fx.success = false;
      fx.error = result.error;
    } else {
      fx.success = true;
      fx.error = undefined;
    }
    return fx;
  };
  fx.devContext = (isDev) => {
    setDevContext(isDev);
    return fx;
  };

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
  async function engineInvoke(fx, params /*, method*/) {
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

    if (result?.success) await notifySubscribersAsync();

    deleteNotices();

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

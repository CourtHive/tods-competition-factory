import { newTournamentRecord } from './generators/newTournamentRecord';
import participantGovernor from './governors/participantGovernor';
import publishingGovernor from './governors/publishingGovernor';
import tournamentGovernor from './governors/tournamentGovernor';
import { notifySubscribers } from '../global/notifySubscribers';
import scheduleGovernor from './governors/scheduleGovernor';
import { factoryVersion } from '../global/factoryVersion';
import policyGovernor from './governors/policyGovernor';
import eventGovernor from './governors/eventGovernor';
import queryGovernor from './governors/queryGovernor';
import venueGovernor from './governors/venueGovernor';
import { getState, setState } from './stateMethods';
import { findEvent } from './getters/eventGetter';
import {
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
  setTournamentRecord,
  removeTournamentRecord,
  getTournamentRecord,
} from '../global/globalState';

import { SUCCESS } from '../constants/resultConstants';

let tournamentId;

export const tournamentEngine = (function () {
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
  function engineInvoke(fx, params /*, method*/) {
    const tournamentRecord = getTournamentRecord(tournamentId);

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

    const result = fx({
      ...params,
      tournamentRecord,
    });

    if (result?.success) {
      notifySubscribers();
    }
    deleteNotices();

    return result;
  }

  function importGovernors(governors) {
    governors.forEach((governor) => {
      Object.keys(governor).forEach((method) => {
        fx[method] = (params) => {
          if (getDevContext()) {
            return engineInvoke(governor[method], params, method);
          } else {
            try {
              return engineInvoke(governor[method], params, method);
            } catch (err) {
              console.log('%c ERROR', 'color: orange', { err });
            }
          }
        };
      });
    });
  }
})();

export default tournamentEngine;

import scoreGovernor from '../matchUpEngine/governors/scoreGovernor';
import structureGovernor from './governors/structureGovernor';
import positionGovernor from './governors/positionGovernor';
import matchUpGovernor from './governors/matchUpGovernor';
import policyGovernor from './governors/policyGovernor';
import queryGovernor from './governors/queryGovernor';
import entryGovernor from './governors/entryGovernor';
import linkGovernor from './governors/linkGovernor';

import { newDrawDefinition, paramsMiddleware, setState } from './stateMethods';
import { notifySubscribers } from '../global/state/notifySubscribers';
import { factoryVersion } from '../global/functions/factoryVersion';
import { modifyDrawNotice } from './notifications/drawNotifications';
import { makeDeepCopy } from '../utilities';
import {
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
  handleCaughtError,
} from '../global/state/globalState';

import { MISSING_DRAW_DEFINITION } from '../constants/errorConditionConstants';
import { SUCCESS } from '../constants/resultConstants';
import { FactoryEngine } from '../types/factoryTypes';

let drawDefinition;
const prefetch = false; // TODO: implement
let tournamentParticipants = [];

export const drawEngine = (function () {
  const engine: FactoryEngine = {
    getState: (params) => ({
      drawDefinition: makeDeepCopy(
        drawDefinition,
        params?.convertExtensions,
        false,
        params?.removeExtensions
      ),
    }),
    version: () => factoryVersion(),
    reset: () => {
      drawDefinition = undefined;
      return { ...SUCCESS };
    },
    newDrawDefinition: (params) => {
      drawDefinition = newDrawDefinition({
        drawId: params?.drawId,
        drawType: params?.drawType,
      });
      return {
        drawDefinition: makeDeepCopy(drawDefinition),
        drawId: drawDefinition.drawId,
        ...SUCCESS,
      };
    },
    setDrawDescription: (params) => {
      if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
      drawDefinition.description = params?.description;
      modifyDrawNotice({ drawDefinition });
      return { drawId: drawDefinition.drawId, ...SUCCESS };
    },
  };

  function processResult(result) {
    if (result?.error) {
      engine.error = result.error;
      engine.success = false;
    } else {
      engine.error = undefined;
      engine.success = true;
      drawDefinition = result;
      engine.drawId = result.drawId;
    }
    return engine;
  }

  importGovernors([
    linkGovernor,
    queryGovernor,
    scoreGovernor,
    entryGovernor,
    policyGovernor,
    matchUpGovernor,
    positionGovernor,
    structureGovernor,
  ]);

  engine.devContext = (isDev) => {
    setDevContext(isDev);
    return engine;
  };
  engine.setParticipants = (participants = []) => {
    tournamentParticipants = participants;
    return engine;
  };
  engine.setState = (definition, deepCopyOption, deepCopyAttributes) => {
    setDeepCopy(deepCopyOption, deepCopyAttributes);
    const result = setState(definition);
    return processResult(result);
  };

  return engine;

  function importGovernors(governors) {
    governors.forEach((governor) => {
      Object.keys(governor).forEach((methodName) => {
        engine[methodName] = (params) => {
          if (getDevContext()) {
            return invoke({ params, governor, methodName });
          } else {
            try {
              return invoke({ params, governor, methodName });
            } catch (err) {
              handleCaughtError({ err, params, methodName });
            }
          }
        };
      });
    });
  }

  function invoke({ params, governor, methodName }) {
    delete engine.success;
    delete engine.error;

    const snapshot =
      params?.rollbackOnError && makeDeepCopy(drawDefinition, false, true);

    // TODO: perhaps prefetch based on targeted methods (e.g. specific governors)
    const additionalParams = prefetch ? paramsMiddleware(drawDefinition) : {};

    params = {
      ...params,
      ...additionalParams,
      tournamentParticipants,
      drawDefinition,
    };

    const result = governor[methodName](params);

    if (result?.error) {
      if (snapshot) setState(snapshot);
      return { ...result, rolledBack: !!snapshot };
    }

    const notify =
      result?.success &&
      params?.delayNotify !== true &&
      params?.doNotNotify !== true;
    if (notify) notifySubscribers();
    if (notify || !result?.success || params?.doNotNotify) deleteNotices();

    return result;
  }
})();

export default drawEngine;

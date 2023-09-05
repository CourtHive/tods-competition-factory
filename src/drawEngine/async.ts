import scoreGovernor from '../matchUpEngine/governors/scoreGovernor';
import structureGovernor from './governors/structureGovernor';
import positionGovernor from './governors/positionGovernor';
import matchUpGovernor from './governors/matchUpGovernor';
import policyGovernor from './governors/policyGovernor';
import queryGovernor from './governors/queryGovernor';
import entryGovernor from './governors/entryGovernor';
import linkGovernor from './governors/linkGovernor';

import { newDrawDefinition, paramsMiddleware, setState } from './stateMethods';
import { notifySubscribersAsync } from '../global/state/notifySubscribers';
import { factoryVersion } from '../global/functions/factoryVersion';
import { modifyDrawNotice } from './notifications/drawNotifications';
import { makeDeepCopy } from '../utilities';
import {
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
  createInstanceState,
} from '../global/state/globalState';

import { MISSING_DRAW_DEFINITION } from '../constants/errorConditionConstants';
import { SUCCESS } from '../constants/resultConstants';
import { FactoryEngine } from '../types/factoryTypes';

let drawDefinition;
const prefetch = false;
let tournamentParticipants = [];

export function drawEngineAsync(
  test?: boolean
): FactoryEngine & { error?: any } {
  const result = createInstanceState();
  if (result.error && !test) return result;

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

  async function importGovernors(governors) {
    for (const governor of governors) {
      const governorMethods = Object.keys(governor);

      for (const governorMethod of governorMethods) {
        engine[governorMethod] = async (params) => {
          if (getDevContext()) {
            return await invoke({ params, governor, governorMethod });
          } else {
            try {
              return await invoke({ params, governor, governorMethod });
            } catch (err) {
              let error;
              if (typeof err === 'string') {
                error = err.toUpperCase();
              } else if (err instanceof Error) {
                error = err.message;
              }
              console.log('ERROR', {
                params: JSON.stringify(params),
                drawId: drawDefinition?.drawId,
                method: governorMethod,
                error,
              });
            }
          }
        };
      }
    }
  }

  async function invoke({ params, governor, governorMethod }) {
    delete engine.success;
    delete engine.error;

    const snapshot =
      params?.rollbackOnError && makeDeepCopy(drawDefinition, false, true);

    const additionalParams = prefetch ? paramsMiddleware(drawDefinition) : {};

    params = {
      ...params,
      ...additionalParams,
      tournamentParticipants,
      drawDefinition,
    };

    const result = governor[governorMethod](params);

    if (result?.error) {
      if (snapshot) setState(snapshot);
      return { ...result, rolledBack: !!snapshot };
    }

    const notify =
      result?.success &&
      params?.delayNotify !== true &&
      params?.doNotNotify !== true;
    if (notify) await notifySubscribersAsync();
    if (notify || !result?.success || params?.doNotNotify) deleteNotices();

    return result;
  }
}

export default drawEngineAsync;

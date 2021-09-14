import { modifyDrawNotice } from './notifications/drawNotifications';
import structureGovernor from './governors/structureGovernor';
import positionGovernor from './governors/positionGovernor';
import matchUpGovernor from './governors/matchUpGovernor';
import policyGovernor from './governors/policyGovernor';
import queryGovernor from './governors/queryGovernor';
import scoreGovernor from './governors/scoreGovernor';
import entryGovernor from './governors/entryGovernor';
import linkGovernor from './governors/linkGovernor';

import { newDrawDefinition, paramsMiddleWare, setState } from './stateMethods';
import { notifySubscribersAsync } from '../global/notifySubscribers';
import { factoryVersion } from '../global/factoryVersion';
import { makeDeepCopy } from '../utilities';
import {
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
  createInstanceState,
} from '../global/globalState';

import { MISSING_DRAW_DEFINITION } from '../constants/errorConditionConstants';
import { SUCCESS } from '../constants/resultConstants';

let drawDefinition;
let prefetch = false;
let tournamentParticipants = [];

export function drawEngineAsync(test) {
  const result = createInstanceState();
  if (result.error && !test) return result;

  const engine = {
    getState: ({ convertExtensions, removeExtensions } = {}) => ({
      drawDefinition: makeDeepCopy(
        drawDefinition,
        convertExtensions,
        false,
        removeExtensions
      ),
    }),
    version: () => factoryVersion(),
    reset: () => {
      drawDefinition = undefined;
      return SUCCESS;
    },
    newDrawDefinition: ({ drawId, drawType } = {}) => {
      drawDefinition = newDrawDefinition({ drawId, drawType });
      return Object.assign(
        {
          drawId: drawDefinition.drawId,
          drawDefinition: makeDeepCopy(drawDefinition),
        },
        SUCCESS
      );
    },
    setDrawDescription: ({ description } = {}) => {
      if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
      drawDefinition.description = description;
      modifyDrawNotice({ drawDefinition });
      return Object.assign({ drawId: drawDefinition.drawId }, SUCCESS);
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
            const result = await invoke({ params, governor, governorMethod });

            return result;
          } else {
            try {
              const result = await invoke({ params, governor, governorMethod });

              return result;
            } catch (err) {
              console.log('%c ERROR', 'color: orange', { err });
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

    const additionalParams = prefetch ? paramsMiddleWare(drawDefinition) : {};

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

    const notify = result?.success && params?.delayNotify !== true;
    if (notify) await notifySubscribersAsync();
    if (notify || !result?.success) deleteNotices();

    return result;
  }
}

export default drawEngineAsync;

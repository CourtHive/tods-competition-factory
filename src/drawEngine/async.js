import { modifyDrawNotice } from './notifications/drawNotifications';
import structureGovernor from './governors/structureGovernor';
import positionGovernor from './governors/positionGovernor';
import matchUpGovernor from './governors/matchUpGovernor';
import policyGovernor from './governors/policyGovernor';
import queryGovernor from './governors/queryGovernor';
import scoreGovernor from './governors/scoreGovernor';
import entryGovernor from './governors/entryGovernor';
import linkGovernor from './governors/linkGovernor';

import { notifySubscribersAsync } from '../global/notifySubscribers';
import definitionTemplate from './generators/drawDefinitionTemplate';
import { factoryVersion } from '../global/factoryVersion';
import { UUID, makeDeepCopy } from '../utilities';
import { paramsMiddleWare, setState } from './stateMethods';
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

function newDrawDefinition({ drawId, drawType } = {}) {
  const drawDefinition = definitionTemplate();
  return Object.assign(drawDefinition, { drawId, drawType });
}

export function drawEngineAsync(test) {
  const result = createInstanceState();
  if (result.error && !test) return result;

  const fx = {
    getState: ({ convertExtensions } = {}) => ({
      drawDefinition: makeDeepCopy(drawDefinition, convertExtensions),
    }),
    version: () => factoryVersion(),
    reset: () => {
      drawDefinition = undefined;
      return SUCCESS;
    },
    newDrawDefinition: ({ drawId = UUID(), drawType, drawProfile } = {}) => {
      drawDefinition = newDrawDefinition({ drawId, drawType, drawProfile });
      return Object.assign({ drawId: drawDefinition.drawId }, SUCCESS);
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
      fx.error = result.error;
      fx.success = false;
    } else {
      fx.error = undefined;
      fx.success = true;
      drawDefinition = result;
      fx.drawId = result.drawId;
    }
    return fx;
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

  fx.devContext = (isDev) => {
    setDevContext(isDev);
    return fx;
  };
  fx.setParticipants = (participants = []) => {
    tournamentParticipants = participants;
    return fx;
  };
  fx.setState = (definition, deepCopyOption) => {
    setDeepCopy(deepCopyOption);
    const result = setState(definition);
    return processResult(result);
  };

  return fx;

  async function importGovernors(governors) {
    for (const governor of governors) {
      const governorMethods = Object.keys(governor);

      for (const governorMethod of governorMethods) {
        fx[governorMethod] = async (params) => {
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

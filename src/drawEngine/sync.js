import { modifyDrawNotice } from './notifications/drawNotifications';
import structureGovernor from './governors/structureGovernor';
import positionGovernor from './governors/positionGovernor';
import matchUpGovernor from './governors/matchUpGovernor';
import policyGovernor from './governors/policyGovernor';
import queryGovernor from './governors/queryGovernor';
import scoreGovernor from '../matchUpEngine/governors/scoreGovernor';
import entryGovernor from './governors/entryGovernor';
import linkGovernor from './governors/linkGovernor';

import { newDrawDefinition, paramsMiddleware, setState } from './stateMethods';
import { notifySubscribers } from '../global/state/notifySubscribers';
import { factoryVersion } from '../global/functions/factoryVersion';
import { makeDeepCopy } from '../utilities';
import {
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
} from '../global/state/globalState';

import { MISSING_DRAW_DEFINITION } from '../constants/errorConditionConstants';
import { SUCCESS } from '../constants/resultConstants';

let drawDefinition;
let prefetch = false;
let tournamentParticipants = [];

export const drawEngine = (function () {
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
      return { ...SUCCESS };
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

  function importGovernors(governors) {
    governors.forEach((governor) => {
      Object.keys(governor).forEach((governorMethod) => {
        engine[governorMethod] = (params) => {
          if (getDevContext()) {
            return invoke({ params, governor, governorMethod });
          } else {
            try {
              return invoke({ params, governor, governorMethod });
            } catch (err) {
              const error = err.toString();
              console.log('ERROR', {
                params: JSON.stringify(params),
                drawId: drawDefinition?.drawId,
                method: governorMethod,
                error,
              });
            }
          }
        };
      });
    });
  }

  function invoke({ params, governor, governorMethod }) {
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

    const result = governor[governorMethod](params);

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

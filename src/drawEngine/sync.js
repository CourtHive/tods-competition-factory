import structureGovernor from './governors/structureGovernor';
import positionGovernor from './governors/positionGovernor';
import matchUpGovernor from './governors/matchUpGovernor';
import policyGovernor from './governors/policyGovernor';
import queryGovernor from './governors/queryGovernor';
import scoreGovernor from './governors/scoreGovernor';
import entryGovernor from './governors/entryGovernor';
import linkGovernor from './governors/linkGovernor';

import definitionTemplate from './generators/drawDefinitionTemplate';
import { notifySubscribers } from '../global/notifySubscribers';
import { factoryVersion } from '../global/factoryVersion';
import { UUID, makeDeepCopy } from '../utilities';
import { paramsMiddleWare, setState } from './stateMethods';
import {
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
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

export const drawEngine = (function () {
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

  function importGovernors(governors) {
    governors.forEach((governor) => {
      Object.keys(governor).forEach((governorMethod) => {
        fx[governorMethod] = (params) => {
          if (getDevContext()) {
            return invoke({ params, governor, governorMethod });
          } else {
            try {
              return invoke({ params, governor, governorMethod });
            } catch (err) {
              console.log('%c ERROR', 'color: orange', { err });
            }
          }
        };
      });
    });
  }

  function invoke({ params, governor, governorMethod }) {
    const snapshot =
      params?.rollbackOnError && makeDeepCopy(drawDefinition, false, true);

    // TODO: perhaps prefetch based on targeted methods (e.g. specific governors)
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
    if (notify) notifySubscribers();
    if (notify || !result?.success) deleteNotices();

    return result;
  }
})();

export default drawEngine;

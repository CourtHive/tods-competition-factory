import linkGovernor from './governors/linkGovernor';
import queryGovernor from './governors/queryGovernor';
import scoreGovernor from './governors/scoreGovernor';
import entryGovernor from './governors/entryGovernor';
import policyGovernor from './governors/policyGovernor';
import matchUpGovernor from './governors/matchUpGovernor';
import positionGovernor from './governors/positionGovernor';
import structureGovernor from './governors/structureGovernor';

import definitionTemplate from './generators/drawDefinitionTemplate';
import { notifySubscribers } from '../global/notifySubscribers';
import { UUID, makeDeepCopy } from '../utilities';
import { setState } from './stateMethods';
import {
  setSubscriptions,
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
} from '../global/globalState';

import { SUCCESS } from '../constants/resultConstants';

let drawDefinition;
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
    version: () => '@VERSION@',
    reset: () => {
      drawDefinition = undefined;
      return SUCCESS;
    },
    setSubscriptions: (subscriptions) => {
      if (typeof subscriptions === 'object')
        setSubscriptions({ subscriptions });
      return fx;
    },
    newDrawDefinition: ({ drawId = UUID(), drawType, drawProfile } = {}) => {
      drawDefinition = newDrawDefinition({ drawId, drawType, drawProfile });
      return Object.assign({ drawId: drawDefinition.drawId }, SUCCESS);
    },
    setDrawDescription: ({ description }) => {
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
  fx.setParticipants = (participants) => {
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
      Object.keys(governor).forEach((key) => {
        fx[key] = (params) => {
          if (getDevContext()) {
            return invoke({ params, governor, key });
          } else {
            try {
              return invoke({ params, governor, key });
            } catch (err) {
              console.log('%c ERROR', 'color: orange', { err });
            }
          }
        };
      });
    });
  }

  function invoke({ params, governor, key }) {
    const result = governor[key]({
      tournamentParticipants,
      drawDefinition,
      ...params,
    });

    if (result?.success) {
      notifySubscribers();
    }
    deleteNotices();

    return result;
  }
})();

export default drawEngine;

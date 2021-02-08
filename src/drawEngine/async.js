import linkGovernor from './governors/linkGovernor';
import queryGovernor from './governors/queryGovernor';
import scoreGovernor from './governors/scoreGovernor';
import entryGovernor from './governors/entryGovernor';
import policyGovernor from './governors/policyGovernor';
import matchUpGovernor from './governors/matchUpGovernor';
import positionGovernor from './governors/positionGovernor';
import structureGovernor from './governors/structureGovernor';

import { addDrawDefinitionExtension } from '../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import {
  notifySubscribers,
  notifySubscribersAsync,
} from '../global/notifySubscribers';
import {
  setSubscriptions,
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
} from '../global/globalState';
import definitionTemplate, {
  keyValidation,
} from './generators/drawDefinitionTemplate';

import { UUID, makeDeepCopy } from '../utilities';
import { SUCCESS } from '../constants/resultConstants';
import {
  INVALID_OBJECT,
  MISSING_DRAW_ID,
  INVALID_DRAW_DEFINITION,
  MISSING_DRAW_DEFINITION,
} from '../constants/errorConditionConstants';

let drawDefinition;
let tournamentParticipants = [];

const policies = {};

function newDrawDefinition({ drawId, drawType, drawProfile } = {}) {
  const drawDefinition = definitionTemplate();
  if (drawProfile) {
    const extension = {
      name: 'drawProfile',
      value: drawProfile,
    };
    addDrawDefinitionExtension({ drawDefinition, extension });
  }

  return Object.assign(drawDefinition, { drawId, drawType });
}

// TASK: add verify/validate structure as option in setState
function setState(definition, deepCopyOption = true) {
  if (!definition) return { error: MISSING_DRAW_DEFINITION };
  if (typeof definition !== 'object') return { error: INVALID_OBJECT };
  if (!definition.drawId) return { error: MISSING_DRAW_ID, method: 'setState' };

  if (!definition.links) definition.links = [];
  if (!definition.entries) definition.entries = [];
  if (!validDefinitionKeys(definition))
    return { error: INVALID_DRAW_DEFINITION };

  drawDefinition = deepCopyOption ? makeDeepCopy(definition) : definition;

  return Object.assign({ drawId: definition.drawId }, SUCCESS);
}

function validDefinitionKeys(definition) {
  const definitionKeys = Object.keys(definition);
  const valid = keyValidation.reduce(
    (p, key) => (!definitionKeys.includes(key) ? false : p),
    true
  );
  return valid;
}

export const drawEngineAsync = (async function () {
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
    setDrawId: ({ drawId }) => {
      drawDefinition.drawId = drawId;
      return Object.assign({ drawId: drawDefinition.drawId }, SUCCESS);
    },
    setDrawDescription: ({ description }) => {
      drawDefinition.description = description;
      return Object.assign({ drawId: drawDefinition.drawId }, SUCCESS);
    },
  };

  await importGovernors([
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
    if (result.error) return result;
    return fx;
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

  async function invoke({ params, governor, key }) {
    const result = governor[key]({
      ...params,
      policies,
      drawDefinition,
      tournamentParticipants,
    });

    if (result?.success) {
      await notifySubscribersAsync();
    }

    deleteNotices();

    return result;
  }
})();

export default drawEngine;

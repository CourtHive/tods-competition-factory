import linkGovernor from './governors/linkGovernor';
import queryGovernor from './governors/queryGovernor';
import scoreGovernor from './governors/scoreGovernor';
import entryGovernor from './governors/entryGovernor';
import policyGovernor from './governors/policyGovernor';
import matchUpGovernor from './governors/matchUpGovernor';
import positionGovernor from './governors/positionGovernor';
import structureGovernor from './governors/structureGovernor';

import { addDrawDefinitionExtension } from '../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { notifySubscribersAsync } from '../global/notifySubscribers';
import {
  setSubscriptions,
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
} from '../global/globalState';
import definitionTemplate from './generators/drawDefinitionTemplate';
import { UUID, makeDeepCopy } from '../utilities';
import { setState } from './stateMethods';

import { SUCCESS } from '../constants/resultConstants';
import { DRAW_PROFILE } from '../constants/extensionConstants';

let drawDefinition;
let tournamentParticipants = [];

function newDrawDefinition({ drawId, drawType, drawProfile } = {}) {
  const drawDefinition = definitionTemplate();
  if (drawProfile) {
    const extension = {
      name: DRAW_PROFILE,
      value: drawProfile,
    };
    addDrawDefinitionExtension({ drawDefinition, extension });
  }

  return Object.assign(drawDefinition, { drawId, drawType });
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

  async function invoke({ params, governor, key }) {
    const result = governor[key]({
      ...params,
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

export default drawEngineAsync;

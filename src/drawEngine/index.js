import linkGovernor from './governors/linkGovernor';
import queryGovernor from './governors/queryGovernor';
import scoreGovernor from './governors/scoreGovernor';
import entryGovernor from './governors/entryGovernor';
import policyGovernor from './governors/policyGovernor';
import matchUpGovernor from './governors/matchUpGovernor';
import positionGovernor from './governors/positionGovernor';
import structureGovernor from './governors/structureGovernor';
import definitionTemplate, {
  keyValidation,
} from './generators/drawDefinitionTemplate';

import { auditEngine } from '../auditEngine';
import { UUID, makeDeepCopy } from '../utilities';
import { SUCCESS } from '../constants/resultConstants';

let devContext;
let errors = [];
const policies = {};
let drawDefinition;
let tournamentParticipants = [];

function newDrawDefinition({ drawId, drawProfile } = {}) {
  const template = definitionTemplate();
  return Object.assign({}, template, { drawId, drawProfile });
}

function setState(definition) {
  if (typeof definition !== 'object') return { error: 'Invalid Object' };
  if (!definition.drawId) return { error: 'Missing drawid' };
  if (!validDefinitionKeys(definition)) return { error: 'Invalid Definition' };
  drawDefinition = makeDeepCopy(definition);
  return Object.assign({ drawId: drawDefinition.drawId }, SUCCESS);
}

function validDefinitionKeys(definition) {
  const definitionKeys = Object.keys(definition);
  const valid = keyValidation.reduce(
    (p, key) => (!definitionKeys.includes(key) ? false : p),
    true
  );
  return valid;
}

function flushErrors() {
  errors = [];
}

export const drawEngine = (function() {
  const coreGovernor = {
    devContext: isDev => {
      devContext = isDev;
    },
    setState: definition => {
      const result = setState(definition);
      if (result && result.error) errors.push(result.error);
    },
    load: definition => {
      return setState(definition);
    },
    getState: () => {
      return {
        drawDefinition: makeDeepCopy(drawDefinition),
        policies: makeDeepCopy(policies),
      };
    },
    reset: () => {
      drawDefinition = null;
      return SUCCESS;
    },
    flushErrors: () => {
      flushErrors();
    },
    getErrors: () => {
      return makeDeepCopy(errors);
    },
    newDrawDefinition: ({ drawId = UUID(), drawProfile } = {}) => {
      flushErrors();
      drawDefinition = newDrawDefinition({ drawId, drawProfile });
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
    setParticipants: participants => {
      tournamentParticipants = participants;
    },
  };

  const fx = {
    ...coreGovernor,
    ...linkGovernor,
    ...queryGovernor,
    ...scoreGovernor,
    ...entryGovernor,
    ...policyGovernor,
    ...matchUpGovernor,
    ...positionGovernor,
    ...structureGovernor,
  };

  importGovernors([
    coreGovernor,
    linkGovernor,
    queryGovernor,
    scoreGovernor,
    entryGovernor,
    policyGovernor,
    matchUpGovernor,
    positionGovernor,
    structureGovernor,
  ]);

  fx.setParticipants = participants => {
    tournamentParticipants = participants;
    return fx;
  };

  return fx;

  function importGovernors(governors) {
    governors.forEach(governor => {
      Object.keys(governor).forEach(key => {
        fx[key] = params => {
          if (devContext) {
            const result = invoke({ params, governor, key });
            return result || fx;
          } else {
            try {
              const result = invoke({ params, governor, key });
              return result || fx;
            } catch (err) {
              console.log('%c ERROR', 'color: orange', { err });
            }
          }
        };
      });
    });
  }

  function invoke({ params, governor, key }) {
    return governor[key]({
      ...params,
      policies,
      drawDefinition,
      tournamentParticipants,
      auditEngine,
    });
  }
})();

export default drawEngine;

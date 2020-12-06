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
import {
  INVALID_OBJECT,
  MISSING_DRAW_ID,
  INVALID_DRAW_DEFINITION,
} from '../constants/errorConditionConstants';

let devContext;
let errors = [];
let drawDefinition;
let tournamentParticipants = [];

const policies = {};

function newDrawDefinition({ drawId, drawProfile } = {}) {
  const template = definitionTemplate();
  return Object.assign({}, template, { drawId, drawProfile });
}

function setState(definition) {
  if (definition.links) definition.links = [];
  if (definition.entries) definition.entries = [];

  if (typeof definition !== 'object') return { error: INVALID_OBJECT };
  if (!definition.drawId) return { error: MISSING_DRAW_ID };
  if (!validDefinitionKeys(definition))
    return { error: INVALID_DRAW_DEFINITION };
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
  const fx = {
    load: definition => {
      return setState(definition);
    },
    getState: () => ({ drawDefinition: makeDeepCopy(drawDefinition) }),
    version: () => '@VERSION@',
    reset: () => {
      drawDefinition = null;
      return SUCCESS;
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
  };

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

  fx.flushErrors = () => {
    flushErrors();
    return fx;
  };
  fx.devContext = isDev => {
    devContext = isDev;
    return fx;
  };
  fx.setParticipants = participants => {
    tournamentParticipants = participants;
    return fx;
  };
  fx.setState = definition => {
    const result = setState(definition);
    if (result && result.error) errors.push(result.error);
    return fx;
  };

  return fx;

  function importGovernors(governors) {
    governors.forEach(governor => {
      Object.keys(governor).forEach(key => {
        fx[key] = params => {
          if (devContext) {
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
    return governor[key]({
      ...params,
      policies,
      devContext,
      drawDefinition,
      tournamentParticipants,
      auditEngine,
    });
  }
})();

export default drawEngine;

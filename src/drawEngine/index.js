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
let tournamentParticipants;

export const drawEngine = (function() {
  const fx = {};

  fx.devContext = isDev => {
    devContext = isDev;
    return fx;
  };

  // convenience method to allow e.g. drawEngine.setState(drawDefinition).allDrawMatchUps();
  fx.setState = definition => {
    const result = fx.load(definition);
    if (result && result.error) errors.push(result.error);
    return fx;
  };

  fx.setParticipants = participants => {
    tournamentParticipants = participants;
    return fx;
  };

  fx.load = definition => {
    if (typeof definition !== 'object') return { error: 'Invalid Object' };
    if (!definition.drawId) return { error: 'Missing drawid' };
    if (!validDefinitionKeys(definition))
      return { error: 'Invalid Definition' };
    drawDefinition = makeDeepCopy(definition);
    return Object.assign({ drawId: drawDefinition.drawId }, SUCCESS);
  };

  fx.getState = () => makeDeepCopy(drawDefinition);
  fx.getErrors = () => makeDeepCopy(errors);
  fx.flushErrors = () => {
    errors = [];
    return fx;
  };

  fx.reset = () => {
    drawDefinition = null;
    return SUCCESS;
  };
  fx.newDrawDefinition = ({ drawId = UUID(), drawProfile } = {}) => {
    fx.flushErrors();
    drawDefinition = newDrawDefinition({ drawId, drawProfile });
    return Object.assign({ drawId: drawDefinition.drawId }, SUCCESS);
  };
  fx.setDrawId = ({ drawId }) => {
    drawDefinition.drawId = drawId;
    return Object.assign({ drawId: drawDefinition.drawId }, SUCCESS);
  };
  fx.setDrawDescription = ({ description }) => {
    drawDefinition.description = description;
    return Object.assign({ drawId: drawDefinition.drawId }, SUCCESS);
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

  return fx;

  function newDrawDefinition({ drawId, drawProfile } = {}) {
    const template = definitionTemplate();
    return Object.assign({}, template, { drawId, drawProfile });
  }

  function validDefinitionKeys(definition) {
    const definitionKeys = Object.keys(definition);
    const valid = keyValidation.reduce(
      (p, key) => (!definitionKeys.includes(key) ? false : p),
      true
    );
    return valid;
  }

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
      drawDefinition,
      tournamentParticipants,
      auditEngine,
    });
  }
})();

export default drawEngine;

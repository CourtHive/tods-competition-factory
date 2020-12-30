import { UUID } from '../utilities';
import { makeDeepCopy } from '../utilities';
import { drawEngine } from '../drawEngine';
import { auditEngine } from '../auditEngine';

import { findEvent } from './getters/eventGetter';
import eventGovernor from './governors/eventGovernor';
import queryGovernor from './governors/queryGovernor';
import venueGovernor from './governors/venueGovernor';
import policyGovernor from './governors/policyGovernor';
import scheduleGovernor from './governors/scheduleGovernor';
import publishingGovernor from './governors/publishingGovernor';
import tournamentGovernor from './governors/tournamentGovernor';
import participantGovernor from './governors/participantGovernor';
import definitionTemplate from './generators/tournamentRecordTemplate';

import {
  INVALID_OBJECT,
  MISSING_TOURNAMENT_ID,
} from '../constants/errorConditionConstants';
import { SUCCESS } from '../constants/resultConstants';

let devContext;
let errors = [];
let deepCopy = true;
let tournamentRecord;

const policies = {};

function newTournamentRecord(props) {
  if (!props.tournamentId) Object.assign(props, { tournamentId: UUID() });
  const template = definitionTemplate(props);
  return Object.assign({}, template, props);
}

function flushErrors() {
  errors = [];
}

function setState(tournament, deepCopyOption = true) {
  if (typeof tournament !== 'object') return { error: INVALID_OBJECT };
  const tournamentId =
    tournament.unifiedTournamentId?.tournamentId || tournament.tournamentId;
  if (!tournamentId) return { error: MISSING_TOURNAMENT_ID };
  tournamentRecord = deepCopyOption ? makeDeepCopy(tournament) : tournament;
  deepCopy = deepCopyOption;

  return Object.assign({ tournamentId }, SUCCESS);
}

export const tournamentEngine = (function () {
  const fx = {
    getState: ({ convertExtensions } = {}) => ({
      tournamentRecord: makeDeepCopy(tournamentRecord, convertExtensions),
    }),
    getAudit: () => {
      const auditTrail = auditEngine.getState();
      auditEngine.reset();
      return auditTrail;
    },

    newTournamentRecord: (props = {}) => {
      flushErrors();
      tournamentRecord = newTournamentRecord(props);
      const tournamentId = tournamentRecord.tournamentId;
      return Object.assign({ tournamentId }, SUCCESS);
    },
  };

  fx.version = () => {
    return '@VERSION@';
  };
  fx.reset = () => {
    tournamentRecord = undefined;
    return SUCCESS;
  };
  fx.getErrors = () => {
    return makeDeepCopy(errors);
  };
  fx.flushErrors = () => {
    flushErrors();
    return fx;
  };
  fx.setState = (tournament) => {
    const result = setState(tournament);
    if (result && result.error) errors.push(result);
    return fx;
  };
  fx.devContext = (isDev) => {
    devContext = isDev;
    drawEngine.devContext(isDev);
    auditEngine.devContext(isDev);
    return fx;
  };

  importGovernors([
    queryGovernor,
    eventGovernor,
    venueGovernor,
    policyGovernor,
    scheduleGovernor,
    publishingGovernor,
    tournamentGovernor,
    participantGovernor,
  ]);

  return fx;

  // enable Middleware
  function engineInvoke(fx, params) {
    if (params) {
      const { drawId } = params || (params.matchUp && params.matchUp.drawId);

      if (drawId) {
        const { event, drawDefinition } = findEvent({
          tournamentRecord,
          drawId,
        });
        const { errors: drawEngineErrors } = drawEngine.setState(
          drawDefinition,
          false // deepCopy false when drawEngine invoked within tournamentEngine
        );
        if (drawEngineErrors) errors = errors.concat(drawEngineErrors);
        params = Object.assign({}, params, { drawDefinition, event });
      } else if (params.eventId && !params.event) {
        const { event } = findEvent({
          tournamentRecord,
          eventId: params.eventId,
        });
        if (event) {
          params = Object.assign({}, params, { event });
        }
      }
    }

    return fx({
      ...params,

      deepCopy,
      policies,
      devContext,
      drawEngine,
      auditEngine,
      tournamentRecord,
    });
  }

  function importGovernors(governors) {
    governors.forEach((governor) => {
      Object.keys(governor).forEach((key) => {
        fx[key] = (params) => {
          if (devContext) {
            return engineInvoke(governor[key], params);
          } else {
            try {
              return engineInvoke(governor[key], params);
            } catch (err) {
              console.log('%c ERROR', 'color: orange', { err });
            }
          }
        };
      });
    });
  }
})();

export default tournamentEngine;

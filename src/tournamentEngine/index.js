import { UUID } from '../utilities';
import { makeDeepCopy } from '../utilities';
import { drawEngine } from '../drawEngine';
import { auditEngine } from '../auditEngine';

import { findEvent } from './getters/eventGetter';
import eventGovernor from './governors/eventGovernor';
import queryGovernor from './governors/queryGovernor';
import venueGovernor from './governors/venueGovernor';
import scheduleGovernor from './governors/scheduleGovernor';
import tournamentGovernor from './governors/tournamentGovernor';
import participantGovernor from './governors/participantGovernor';
import definitionTemplate from './generators/tournamentRecordTemplate';

import { SUCCESS } from '../constants/resultConstants';

let devContext;
let errors = [];
let tournamentRecord;

export const tournamentEngine = function() {
  let fx = {};

  fx.devContext = (isDev) => {
    devContext = isDev;
    drawEngine.devContext(isDev);
    auditEngine.devContext(isDev);
    return fx;
  }
  fx.getState = () => makeDeepCopy(tournamentRecord);
  fx.getAudit = () => {
    const auditTrail = auditEngine.getState();
    auditEngine.reset();
    return auditTrail;
  }

  fx.setState = tournament => {
    const result = fx.load(tournament);
    if (result && result.error) errors.push(result.error);
    return fx;
  }

  fx.flushErrors = () => {
    errors = [];
    return fx;
  }
  
  fx.load = tournament => {
    if (typeof tournament !== 'object') return { error: 'Invalid Object' };
    if (!tournament.tournamentId) return { error: 'Missing tournamentId' };
    tournamentRecord = makeDeepCopy(tournament);
    return Object.assign({tournamentId: tournamentRecord.tournamentId}, SUCCESS );
  };

  fx.newTournamentRecord = (props={}) => {
    fx.flushErrors();
    tournamentRecord = newTournamentRecord(props);
    return Object.assign({tournamentId: tournamentRecord.tournamentId}, SUCCESS );
  }
  importGovernors([
    queryGovernor,
    eventGovernor,
    venueGovernor,
    scheduleGovernor,
    tournamentGovernor,
    participantGovernor
  ]);

  return fx;
  
  function newTournamentRecord(props) {
    if (!props.tournamentId) Object.assign(props, { tournamentId: UUID() });
    let template = definitionTemplate();
    return Object.assign({}, template, props);
  }

  // enable Middleware
  function engineInvoke(fx, params) {
    if (params) {
      let { drawId } = params || (params.matchUp && params.matchUp.drawId);

      if (drawId) {
        const { event, drawDefinition } = findEvent({tournamentRecord, drawId});
        const { errors: drawEngineErrors } = drawEngine.setState(drawDefinition);
        if (drawEngineErrors) errors = errors.concat(drawEngineErrors);
        params = Object.assign({}, params, { drawDefinition, event });
      }
    }

    return fx({...params, tournamentRecord, drawEngine, auditEngine})
  }

  function importGovernors(governors) {
    governors.forEach(governor => {
      Object.keys(governor)
        .forEach(key => {
          fx[key] = params => {
            if (devContext) {
              return engineInvoke(governor[key], params);
            } else {
              try { return engineInvoke(governor[key], params); }
              catch (err) { console.log('%c ERROR', 'color: orange', {err}); }
            }
          }
        });
    })
  }

}();

export default tournamentEngine;

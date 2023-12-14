import { completeDrawMatchUps } from '../../../mocksEngine/generators/completeDrawMatchUps';
import eventGovernor from '../../../tournamentEngine/governors/eventGovernor';
import mocksEngine from '../../../mocksEngine';
import syncEngine from '../../engines/sync';
import askEngine from '../../engines/ask';
import { expect, test } from 'vitest';

import { deleteDrawDefinitions } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/deleteDrawDefinitions';
import { getMethods } from '../../../global/state/syncGlobalState';
import { setGlobalLog, setMethods } from '../../../global/state/globalState';
import * as query from '../../../../dist/forge/query';

import {
  METHOD_NOT_FOUND,
  SCORES_PRESENT,
} from '../../../constants/errorConditionConstants';
import { getParticipants } from '../../../tournamentEngine/getters/participants/getParticipants';

test('sync syncEngine can set state and execute methods', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 8 }],
  });
  const tournamentId = tournamentRecord.tournamentId;

  // syncEngine can set state
  const stateResult = syncEngine.setState(tournamentRecord);
  expect(stateResult.success).toEqual(true);

  // syncEngine can get state, confirming set state was successful
  let state = syncEngine.getState();
  expect(state.tournamentId === tournamentId).toEqual(true);
  expect(
    state.tournamentRecords[tournamentId].tournamentId === tournamentId
  ).toEqual(true);

  // syncEngine can execute a method which is passed as a parameter
  let executionResult = syncEngine.execute({
    completeDrawMatchUps,
    params: { drawId },
  });
  expect(executionResult.success).toEqual(true);
  expect(executionResult.completedCount).toEqual(7);

  // syncEngine can get state, confirming method execution was successful
  state = syncEngine.getState();
  const competitionParticipants =
    query.getCompetitionParticipants(state).competitionParticipants;
  expect(competitionParticipants?.length).toEqual(8);

  const matchUps = query.allCompetitionMatchUps(state).matchUps;
  expect(matchUps?.length).toEqual(7);

  const allCompleted = matchUps?.every(query.scoreHasValue);
  expect(allCompleted).toEqual(true);

  // syncEngine will throw error if method is not found
  executionResult = syncEngine.executionQueue([
    {
      method: 'deleteDrawDefinitions',
      params: { drawIds: [drawId] },
    },
  ]);

  expect(executionResult.error).toEqual(METHOD_NOT_FOUND);

  // methods can be set in global state
  setMethods({ deleteDrawDefinitions });
  const methodResult = getMethods();
  expect(typeof methodResult['deleteDrawDefinitions']).toEqual('function');

  // syncEngine can execute a method which is set in global state
  executionResult = syncEngine.executionQueue([
    {
      method: 'deleteDrawDefinitions',
      params: { drawIds: [drawId] },
    },
  ]);

  expect(executionResult.error).toEqual(SCORES_PRESENT);

  // syncEngine can execute a method which is set in global state
  executionResult = syncEngine.executionQueue([
    {
      params: { drawIds: [drawId], force: true },
      method: 'deleteDrawDefinitions',
    },
  ]);

  expect(executionResult.success).toEqual(true);
});

test('syncEngine can import and execute methods', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 8 }],
  });

  syncEngine.setState(tournamentRecord);

  // askEngine can import methods
  const importResult = syncEngine.importMethods(eventGovernor);
  expect(importResult.success).toEqual(true);
  expect(typeof importResult.deleteDrawDefinitions).toEqual('function');

  // syncEngine can execute imported methods
  const executionResult = syncEngine.deleteDrawDefinitions({
    drawIds: [drawId],
  });
  expect(executionResult.success).toEqual(true);
});

test('askEngine can import and execute methods', () => {
  const globalLog = (log) => {
    expect(log.log.method).toEqual('getParticipants');
    expect(log.engine).toEqual('ask');
  };
  setGlobalLog(globalLog);
  askEngine.devContext({ perf: 0, result: true });

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 8 }],
  });

  askEngine.setState(tournamentRecord);

  let executionResult = askEngine.execute({ getParticipants });
  expect(executionResult.participants.length).toEqual(8);

  // askEngine can import methods
  const importResult = askEngine.importMethods({ getParticipants });
  expect(importResult.success).toEqual(true);
  expect(typeof importResult.getParticipants).toEqual('function');

  // askEngine can execute imported methods
  executionResult = askEngine.getParticipants();
  expect(executionResult.participants.length).toEqual(8);
});

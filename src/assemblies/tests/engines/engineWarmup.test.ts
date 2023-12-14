import { completeDrawMatchUps } from '../../../mocksEngine/generators/completeDrawMatchUps';
import eventGovernor from '../../../tournamentEngine/governors/eventGovernor';
import mocksEngine from '../../../mocksEngine';
import engine from '../../engines/sync';
import { expect, test } from 'vitest';

import { deleteDrawDefinitions } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/deleteDrawDefinitions';
import { getMethods } from '../../../global/state/syncGlobalState';
import { setMethods } from '../../../global/state/globalState';
import * as query from '../../../../dist/forge/query';

import {
  METHOD_NOT_FOUND,
  SCORES_PRESENT,
} from '../../../constants/errorConditionConstants';

test('assembly engine can set state and execute method', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 8 }],
  });
  const tournamentId = tournamentRecord.tournamentId;

  // engine can set state
  const stateResult = engine.setState(tournamentRecord);
  expect(stateResult.success).toEqual(true);

  // engine can get state, confirming set state was successful
  let state = engine.getState();
  expect(state.tournamentId === tournamentId).toEqual(true);
  expect(
    state.tournamentRecords[tournamentId].tournamentId === tournamentId
  ).toEqual(true);

  // engine can execute a method which is passed as a parameter
  let executionResult = engine.execute({
    completeDrawMatchUps,
    params: { drawId },
  });
  expect(executionResult.success).toEqual(true);
  expect(executionResult.completedCount).toEqual(7);

  // engine can get state, confirming method execution was successful
  state = engine.getState();
  const competitionParticipants =
    query.getCompetitionParticipants(state).competitionParticipants;
  expect(competitionParticipants?.length).toEqual(8);

  const matchUps = query.allCompetitionMatchUps(state).matchUps;
  expect(matchUps?.length).toEqual(7);

  const allCompleted = matchUps?.every(query.scoreHasValue);
  expect(allCompleted).toEqual(true);

  // engine will throw error if method is not found
  executionResult = engine.executionQueue([
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

  // engine can execute a method which is set in global state
  executionResult = engine.executionQueue([
    {
      method: 'deleteDrawDefinitions',
      params: { drawIds: [drawId] },
    },
  ]);

  expect(executionResult.error).toEqual(SCORES_PRESENT);

  // engine can execute a method which is set in global state
  executionResult = engine.executionQueue([
    {
      params: { drawIds: [drawId], force: true },
      method: 'deleteDrawDefinitions',
    },
  ]);

  expect(executionResult.success).toEqual(true);
});

test('assembly engine can import and execute methods', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 8 }],
  });

  engine.setState(tournamentRecord);

  // engine can import methods
  const importResult = engine.importMethods(eventGovernor);
  expect(importResult.success).toEqual(true);
  expect(typeof importResult.deleteDrawDefinitions).toEqual('function');

  // engine can execute imported methods
  const executionResult = engine.deleteDrawDefinitions({ drawIds: [drawId] });
  console.log({ executionResult });
});

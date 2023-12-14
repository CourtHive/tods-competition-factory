import { completeDrawMatchUps } from '../../../mocksEngine/generators/completeDrawMatchUps';
import mocksEngine from '../../../mocksEngine';
import engine from '../../engine/sync';
import { expect, test } from 'vitest';

import { deleteDrawDefinitions } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/deleteDrawDefinitions';
import { getMethods } from '../../../global/state/syncGlobalState';
import { setMethods } from '../../../global/state/globalState';
import * as query from '../../../../dist/forge/query';

import {
  METHOD_NOT_FOUND,
  SCORES_PRESENT,
} from '../../../constants/errorConditionConstants';

test('assembly engine can set state and execute a method', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 8 }],
  });
  const tournamentId = tournamentRecord.tournamentId;
  const stateResult = engine.setState(tournamentRecord);
  expect(stateResult.success).toEqual(true);

  let state = engine.getState();
  expect(state.tournamentId === tournamentId).toEqual(true);
  expect(
    state.tournamentRecords[tournamentId].tournamentId === tournamentId
  ).toEqual(true);

  let executionResult = engine.execute({
    completeDrawMatchUps,
    params: { drawId },
  });
  expect(executionResult.success).toEqual(true);
  expect(executionResult.completedCount).toEqual(7);

  state = engine.getState();
  const competitionParticipants =
    query.getCompetitionParticipants(state).competitionParticipants;
  expect(competitionParticipants?.length).toEqual(8);

  const matchUps = query.allCompetitionMatchUps(state).matchUps;
  expect(matchUps?.length).toEqual(7);

  const allCompleted = matchUps?.every(query.scoreHasValue);
  expect(allCompleted).toEqual(true);

  executionResult = engine.executionQueue([
    {
      method: 'deleteDrawDefinitions',
      params: { drawIds: [drawId] },
    },
  ]);

  expect(executionResult.error).toEqual(METHOD_NOT_FOUND);

  setMethods({ deleteDrawDefinitions });
  const methodResult = getMethods();
  expect(typeof methodResult['deleteDrawDefinitions']).toEqual('function');

  executionResult = engine.executionQueue([
    {
      method: 'deleteDrawDefinitions',
      params: { drawIds: [drawId] },
    },
  ]);

  expect(executionResult.error).toEqual(SCORES_PRESENT);
});

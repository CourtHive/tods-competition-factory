import { expect, it } from 'vitest';
import {
  setStateProvider,
  setSubscriptions,
  tournamentEngineAsync,
  competitionEngineAsync,
  mocksEngine,
} from '@Global/state/globalState';

/**
 * Example of how to use asyncGlobalState
 */

import asyncGlobalState from '../asyncEngine/asyncGlobalState';

const ssp = setStateProvider(asyncGlobalState);
/*
// const competitionEngineAsync = competitionEngineAsync();
// const tournamentEngineAsync = tournamentEngineAsync();
*/

// NOTE: won't run on vitest > 0.27.3
it.skip('can setStateProvier', async () => {
  // expect setting state provider to have succeeded
  expect(ssp.success).toEqual(true);

  const allMatchUps = [];
  const auditNotices = [];
  const allParticipants = [];
  const modifiedMatchUps = [];
  const allDeletedMatchUpIds = [];

  let result = await tournamentEngineAsync.setTournamentId();
  expect(result.error).not.toBeUndefined();

  result = await tournamentEngineAsync.setTournamentId();
  expect(result.error).not.toBeUndefined();

  result = await competitionEngineAsync.setTournamentRecord();
  expect(result.error).not.toBeUndefined();

  result = await competitionEngineAsync.setTournamentRecord({});
  expect(result.error).not.toBeUndefined();

  result = await competitionEngineAsync.reset();
  expect(result.success).toEqual(true);

  result = await tournamentEngineAsync.reset();
  expect(result.success).toEqual(true);

  result = await competitionEngineAsync.version();
  expect(result).not.toBeUndefined();

  result = await tournamentEngineAsync.version();
  expect(result).not.toBeUndefined();

  result = await competitionEngineAsync.removeTournamentRecord();
  expect(result.error).not.toBeUndefined();

  result = await competitionEngineAsync.removeTournamentRecord('bogusId');
  expect(result.error).not.toBeUndefined();

  const subscriptions = {
    audit: (notices) => auditNotices.push(...notices),
    addMatchUps: (addedMatchUps) => {
      addedMatchUps.forEach(({ matchUps }) => {
        allMatchUps.push(...matchUps);
      });
    },
    modifyMatchUp: (modified) => {
      modified.forEach(({ matchUp }) => modifiedMatchUps.push(matchUp));
    },
    deletedMatchUpIds: (deletedMatchUpIds) => {
      deletedMatchUpIds.forEach(({ matchUpIds }) => {
        allDeletedMatchUpIds.push(...matchUpIds);
      });
    },
    addParticipants: (addedParticipants) => {
      addedParticipants.forEach(({ participants }) => {
        allParticipants.push(...participants);
      });
    },
  };
  setSubscriptions({ subscriptions });

  result = await tournamentEngineAsync.newTournamentRecord();
  expect(result.success).toEqual(true);
  expect(result.tournamentId).not.toBeUndefined();

  let { tournamentRecord } = await tournamentEngineAsync.getState();
  expect(tournamentRecord).not.toBeUndefined();

  result = await tournamentEngineAsync.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  result = await competitionEngineAsync.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let drawId, eventId;
  const drawSize = 8;
  const participantsCount = 37;
  ({
    tournamentRecord,
    drawIds: [drawId],
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount },
    drawProfiles: [{ drawSize }],
  }));

  expect(allMatchUps.length).toEqual(drawSize - 1);
  expect(allParticipants.length).toEqual(participantsCount);

  result = await competitionEngineAsync.setTournamentRecord(tournamentRecord);
  expect(result.success).toEqual(true);

  result = await tournamentEngineAsync.setTournamentId(tournamentRecord.tournamentId);
  expect(result.success).toEqual(true);

  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '7-5 7-5',
    winningSide: 1,
  });

  result = await tournamentEngineAsync.setMatchUpStatus({
    matchUpId: allMatchUps[0].matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);
  expect(modifiedMatchUps.length).toEqual(2);

  result = await tournamentEngineAsync.deleteDrawDefinitions({
    drawIds: [drawId],
    eventId,
  });
  expect(result.success).toEqual(true);
  expect(auditNotices.length).toEqual(1);

  // expect 7 matchUps to have been deleted
  expect(allDeletedMatchUpIds.length).toEqual(drawSize - 1);

  const { drawDefinition } = await tournamentEngineAsync.generateDrawDefinition({
    drawSize,
    eventId,
  });
  result = await tournamentEngineAsync.addDrawDefinition({
    eventId,
    drawDefinition,
  });
  expect(result.success).toEqual(true);

  let { tournamentRecords } = await competitionEngineAsync.getState();
  const tournamentIds = Object.keys(tournamentRecords);
  expect(tournamentIds.length).toEqual(2);

  result = await competitionEngineAsync.removeTournamentRecord(tournamentIds[0]);
  expect(result.success).toEqual(true);

  // removing the tournamentRecord matching globalState.tournamentId
  // caused there to be only one tournamentRecord in globalState
  // and globalState.tournamentId was updated to point to this remaining tournament
  ({ tournamentRecord } = await tournamentEngineAsync.getState());
  expect(tournamentRecord.tournamentId).toEqual(tournamentIds[1]);

  ({ tournamentRecords } = await competitionEngineAsync.getState());
  expect(Object.keys(tournamentRecords).length).toEqual(1);

  result = await competitionEngineAsync.removeTournamentRecord(tournamentIds[1]);
  expect(result.success).toEqual(true);

  result = setSubscriptions('not an object');
  expect(result.error).not.toBeUndefined();
});

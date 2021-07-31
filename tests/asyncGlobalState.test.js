import {
  setStateProvider,
  setSubscriptions,
  tournamentEngineAsync,
  competitionEngineAsync,
  mocksEngine,
} from '../dist/tods-competition-factory.esm';

import asyncGlobalState from '../src/global/examples/asyncGlobalState';

/**
 * Example of how to use asyncGlobalState
 */

const ssp = setStateProvider(asyncGlobalState);
const asyncTournamentEngine = tournamentEngineAsync();
const asyncCompetitionEngine = competitionEngineAsync();

it('can setStateProvier', async () => {
  // expect setting state provider to have succeeded
  expect(ssp.success).toEqual(true);

  const allNotices = [];
  const allMatchUps = [];
  const allParticipants = [];
  const allDeletedMatchUpIds = [];

  const subscriptions = {
    audit: (notices) => allNotices.push(...notices),
    addMatchUps: (addedMatchUps) => {
      addedMatchUps.forEach(({ matchUps }) => {
        allMatchUps.push(...matchUps);
      });
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

  let result = await asyncTournamentEngine.newTournamentRecord();
  expect(result.success).toEqual(true);
  expect(result.tournamentId).not.toBeUndefined();

  let { tournamentRecord } = await asyncTournamentEngine.getState();
  result = await asyncCompetitionEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let drawId, eventId;
  const drawSize = 8;
  const participantsCount = 37;
  ({
    tournamentRecord,
    drawIds: [drawId],
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize }],
    participantsProfile: { participantsCount },
  }));

  expect(allNotices.length).toEqual(1);
  expect(allMatchUps.length).toEqual(drawSize - 1);
  expect(allParticipants.length).toEqual(participantsCount);

  result = await asyncCompetitionEngine.setTournamentRecord(tournamentRecord);
  expect(result.success).toEqual(true);

  result = await asyncTournamentEngine.setTournamentId(
    tournamentRecord.tournamentId
  );
  expect(result.success).toEqual(true);

  result = await asyncTournamentEngine.deleteDrawDefinitions({
    eventId,
    drawIds: [drawId],
  });
  expect(result.success).toEqual(true);

  expect(allNotices.length).toEqual(2);

  // expect 7 matchUps to have been deleted
  expect(allDeletedMatchUpIds.length).toEqual(drawSize - 1);

  let { tournamentRecords } = await asyncCompetitionEngine.getState();
  const tournamentIds = Object.keys(tournamentRecords);
  expect(tournamentIds.length).toEqual(2);

  result = await asyncCompetitionEngine.removeTournamentRecord(
    tournamentIds[0]
  );
  expect(result.success).toEqual(true);

  // removing the tournamentRecord matching globalState.tournamentId
  // caused there to be only one tournamentRecord in globalState
  // and globalState.tournamentId was updated to point to this remaining tournament
  ({ tournamentRecord } = await asyncTournamentEngine.getState());
  expect(tournamentRecord.tournamentId).toEqual(tournamentIds[1]);

  ({ tournamentRecords } = await asyncCompetitionEngine.getState());
  expect(Object.keys(tournamentRecords).length).toEqual(1);
});

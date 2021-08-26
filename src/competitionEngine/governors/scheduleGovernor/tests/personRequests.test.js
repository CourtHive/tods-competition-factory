import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';

import { DO_NOT_SCHEDULE } from '../../../../constants/requestConstants';

it('can add, query, amd remove personRequests across multiple tournaments', () => {
  const { tournamentRecord: tournament1 } =
    mocksEngine.generateTournamentRecord();
  const { tournamentRecord: tournament2 } =
    mocksEngine.generateTournamentRecord();

  const personId = tournament1.participants[0].person.personId;

  competitionEngine.setState([tournament1, tournament2]);
  const { startDate, endDate } = competitionEngine.getCompetitionDateRange();

  const request = {
    date: startDate,
    startTime: '08:00',
    endTime: '10:00',
    requestType: DO_NOT_SCHEDULE,
  };
  let result = competitionEngine.addPersonRequests({
    personId,
    requests: [request],
  });
  expect(result.success).toEqual(true);

  let { personRequests } = competitionEngine.getPersonRequests();
  expect(personRequests[personId].length).toEqual(1);

  let { tournamentRecords } = competitionEngine.getState();
  // extension is only added to the tournament which includes participant with personId
  expect(Object.values(tournamentRecords)[0].extensions.length).toEqual(1);
  expect(Object.values(tournamentRecords)[1].extensions).toBeUndefined();

  let requestId = personRequests[personId][0].requestId;
  expect(requestId).not.toBeUndefined();

  result = competitionEngine.removePersonRequests({ personId, requestId });
  expect(result.success).toEqual(true);
  expect(result.removed).toEqual(1);

  ({ tournamentRecords } = competitionEngine.getState());
  expect(Object.values(tournamentRecords)[0].extensions.length).toEqual(0);

  // now remove a request using only the requestId
  result = competitionEngine.addPersonRequests({
    personId,
    requests: [request],
  });
  expect(result.success).toEqual(true);
  ({ personRequests } = competitionEngine.getPersonRequests());
  let requestObject = personRequests[personId][0];
  requestId = requestObject.requestId;
  result = competitionEngine.removePersonRequests({ requestId });
  expect(result.success).toEqual(true);
  expect(result.removed).toEqual(1);

  // now modify a request
  result = competitionEngine.addPersonRequests({
    personId,
    requests: [request],
  });
  expect(result.success).toEqual(true);
  ({ personRequests } = competitionEngine.getPersonRequests());
  requestObject = personRequests[personId][0];
  expect(requestObject.date).toEqual(startDate);
  requestObject.date = endDate;
  result = competitionEngine.modifyPersonRequests({
    requests: [requestObject],
  });
  expect(result.success).toEqual(true);
  ({ personRequests } = competitionEngine.getPersonRequests());
  requestObject = personRequests[personId][0];
  expect(requestObject.date).toEqual(endDate);
});

it('can identify conflicts with person requests', () => {
  // ensure that tournament has exactly 16 participants
  // so that conflict can be assured for testing purposes
  const participantsCount = 16;
  const drawProfiles = [{ drawSize: participantsCount }];
  const venueProfiles = [{ courtsCount: 6 }];

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    venueProfiles,
    participantsProfile: { participantsCount },
  });

  expect(tournamentRecord.participants.length).toEqual(participantsCount);

  const personId = tournamentRecord.participants[0].person.personId;

  competitionEngine.setState([tournamentRecord]);
  const { matchUps } = competitionEngine.allCompetitionMatchUps();
  const { startDate } = competitionEngine.getCompetitionDateRange();

  const request = {
    date: startDate,
    startTime: '08:00',
    endTime: '10:00',
    requestType: DO_NOT_SCHEDULE,
  };
  let result = competitionEngine.addPersonRequests({
    personId,
    requests: [request],
  });
  expect(result.success).toEqual(true);

  const matchUpIds = matchUps.map(({ matchUpId }) => matchUpId);

  result = competitionEngine.scheduleMatchUps({
    date: startDate,
    matchUpIds,
  });
  expect(result.requestConflicts.length).toBeGreaterThan(0);
  expect(result.noTimeMatchUpIds.length).toEqual(0);
  expect(result.scheduledMatchUpIds.length).toEqual(15);

  // individuals will have late recovery times due to defered scheduling / conflict avoidance
  const lateRecoveryTimes = Object.values(result.individualParticipantProfiles)
    .map(({ timeAfterRecovery }) => timeAfterRecovery)
    .filter((time) => time > '11:00');
  expect(lateRecoveryTimes.length).toEqual(2);
});

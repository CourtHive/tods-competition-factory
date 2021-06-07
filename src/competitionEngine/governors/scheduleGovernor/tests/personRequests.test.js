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
  const { startDate } = competitionEngine.getCompetitionDateRange();

  const request = {
    date: startDate,
    startTime: '08:00',
    endTime: '10:00',
    requestType: DO_NOT_SCHEDULE,
  };
  let result = competitionEngine.addPersonRequest({ personId, request });
  expect(result.success).toEqual(true);

  let { personRequests } = competitionEngine.getPersonRequests();
  expect(personRequests[personId].length).toEqual(1);

  let { tournamentRecords } = competitionEngine.getState();
  // extension is only added to the tournament which includes participant with personId
  expect(Object.values(tournamentRecords)[0].extensions.length).toEqual(1);
  expect(Object.values(tournamentRecords)[1].extensions).toBeUndefined();

  let requestId = personRequests[personId][0].request.requestId;
  expect(requestId).not.toBeUndefined();

  result = competitionEngine.removePersonRequest({ personId, requestId });
  expect(result.success).toEqual(true);
  expect(result.removed).toEqual(1);

  ({ tournamentRecords } = competitionEngine.getState());
  expect(Object.values(tournamentRecords)[0].extensions.length).toEqual(0);

  // now remove a request using only the requestId
  result = competitionEngine.addPersonRequest({ personId, request });
  expect(result.success).toEqual(true);
  ({ personRequests } = competitionEngine.getPersonRequests());
  requestId = personRequests[personId][0].request.requestId;
  result = competitionEngine.removePersonRequest({ requestId });
  expect(result.success).toEqual(true);
  expect(result.removed).toEqual(1);
});

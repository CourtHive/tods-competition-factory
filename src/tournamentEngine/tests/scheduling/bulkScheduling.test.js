import { tournamentEngine } from '../../sync';

import { eventConstants } from '../../../constants/eventConstants';
import { resultConstants } from '../../../constants/resultConstants';

import { generateTournamentWithParticipants } from '../../../mocksEngine/generators/generateTournamentWithParticipants';
import { getStructureRoundProfile } from '../../../drawEngine/getters/getMatchUps/getStructureRoundProfile';

import { INVALID_VALUES } from '../../../constants/errorConditionConstants';
import SEEDING_ITF_POLICY from '../../../fixtures/policies/POLICY_SEEDING_ITF';

const { SINGLES } = eventConstants;
const { SUCCESS } = resultConstants;

it('can generate a tournament with events and draws', () => {
  const { tournamentRecord } = generateTournamentWithParticipants({
    startDate: '2020-01-01',
    endDate: '2020-01-06',
    participantsCount: 32,
  });
  const { participants } = tournamentRecord;

  tournamentEngine.setState(tournamentRecord);

  const myCourts = { venueName: 'My Courts' };
  let result = tournamentEngine.devContext(true).addVenue({ venue: myCourts });
  const {
    venue: { venueId },
  } = result;
  expect(result.success).toEqual(true);

  const event = {
    eventName: 'Test Event',
    eventType: SINGLES,
  };

  result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  const values = {
    automated: true,
    drawSize: 32,
    eventId,
    seedsCount: 8,
    event: eventResult,
    policyDefinitions: [SEEDING_ITF_POLICY],
  };
  const { drawDefinition } = tournamentEngine.generateDrawDefinition(values);

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);

  const { structureId } = drawDefinition.structures[0];
  const { roundMatchUps } = getStructureRoundProfile({
    drawDefinition,
    structureId,
  });

  const matchUpIds = roundMatchUps[1].map((matchUp) => matchUp.matchUpId);

  let schedule = { scheduledTime: '08:00 x y z' };
  result = tournamentEngine.bulkScheduleMatchUps({ matchUpIds, schedule });
  expect(result.error).toEqual(INVALID_VALUES);

  schedule = { venueId: 'bogus venue' };
  result = tournamentEngine.bulkScheduleMatchUps({ matchUpIds, schedule });
  expect(result.error).toEqual(INVALID_VALUES);

  schedule = { scheduledDayDate: 'December 3rd 2100' };
  result = tournamentEngine.bulkScheduleMatchUps({ matchUpIds, schedule });
  expect(result.error).toEqual(INVALID_VALUES);

  schedule = {
    scheduledTime: '08:00',
    scheduledDayDate: '2021-01-01',
    venueId,
  };
  result = tournamentEngine.bulkScheduleMatchUps({ matchUpIds, schedule });

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  const matchUpsWithScheduledTime = matchUps.filter(
    (matchUp) => matchUp.schedule?.scheduledTime
  );

  expect(matchUpsWithScheduledTime.length).toEqual(matchUpIds.length);
});

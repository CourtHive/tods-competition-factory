import { getStructureRoundProfile } from '../../../drawEngine/getters/getMatchUps/getStructureRoundProfile';
import competitionEngine from '../../../competitionEngine/sync';
import drawEngine from '../../../drawEngine/sync';
import mocksEngine from '../../../mocksEngine';
import { tournamentEngine } from '../../sync';

import { eventConstants } from '../../../constants/eventConstants';

import POLICY_SCHEDULING_USTA from '../../../fixtures/policies/POLICY_SCHEDULING_USTA';
import SEEDING_ITF_POLICY from '../../../fixtures/policies/POLICY_SEEDING_ITF';
import {
  INVALID_DATE,
  INVALID_TIME,
  VENUE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

const { SINGLES } = eventConstants;

it('can bulk schedule matchUps', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  const { participants } = tournamentRecord;

  tournamentEngine.setState(tournamentRecord);

  const myCourts = { venueName: 'My Courts' };
  let result = tournamentEngine
    .devContext({ addVenue: true })
    .addVenue({ venue: myCourts });
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
  expect(result.success).toEqual(true);

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
  expect(result.success).toEqual(true);

  const { structureId } = drawDefinition.structures[0];
  const { roundMatchUps } = getStructureRoundProfile({
    drawDefinition,
    structureId,
  });

  const matchUpIds = roundMatchUps[1].map((matchUp) => matchUp.matchUpId);

  let schedule = { scheduledTime: '08:00 x y z' };
  result = tournamentEngine.bulkScheduleMatchUps({ matchUpIds, schedule });
  expect(result.error).toEqual(INVALID_TIME);

  schedule = { venueId: 'bogus venue' };
  result = tournamentEngine.bulkScheduleMatchUps({ matchUpIds, schedule });
  expect(result.error).toEqual(VENUE_NOT_FOUND);

  schedule = { scheduledDate: 'December 3rd 2100' };
  result = tournamentEngine.bulkScheduleMatchUps({ matchUpIds, schedule });
  expect(result.error).toEqual(INVALID_DATE);

  const scheduledDate = '2021-01-01';
  const scheduledTime = '08:00';
  schedule = {
    scheduledTime,
    scheduledDate,
    venueId,
  };
  result = tournamentEngine.bulkScheduleMatchUps({ matchUpIds, schedule });
  expect(result.success).toEqual(true);

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  let matchUpsWithScheduledTime = matchUps.filter(
    (matchUp) => matchUp.schedule?.scheduledTime
  );

  expect(matchUpsWithScheduledTime.length).toEqual(matchUpIds.length);

  schedule = {
    scheduledTime: '',
    scheduledDate: '',
    venueId,
  };
  result = tournamentEngine.bulkScheduleMatchUps({ matchUpIds, schedule });
  expect(result.success).toEqual(true);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  matchUpsWithScheduledTime = matchUps.filter(
    (matchUp) => matchUp.schedule?.scheduledTime
  );
  expect(matchUpsWithScheduledTime.length).toEqual(0);
});

test('recognizes scheduling conflicts', () => {
  const visibilityThreshold = Date.now();

  const eventProfiles = [
    {
      eventName: 'Event Test',
      eventType: SINGLES,
      drawProfiles: [
        {
          drawSize: 16,
        },
      ],
    },
  ];
  const startDate = '2022-01-01';
  const endDate = '2022-01-07';
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    eventProfiles,
    startDate,
    endDate,
  });

  competitionEngine.setState(tournamentRecord);

  competitionEngine.attachPolicy({
    policyDefinition: POLICY_SCHEDULING_USTA,
  });

  let { matchUps } = competitionEngine.allCompetitionMatchUps();
  let { roundMatchUps } = drawEngine.getRoundMatchUps({ matchUps });

  const scheduledDate = '2021-01-01';
  let schedule = {
    scheduledTime: '08:00',
    scheduledDate,
  };
  let matchUpIds = roundMatchUps[1].map(({ matchUpId }) => matchUpId);
  let result = tournamentEngine.bulkScheduleMatchUps({ matchUpIds, schedule });
  expect(result.success).toEqual(true);

  schedule = {
    scheduledTime: '09:00',
    scheduledDate,
  };
  matchUpIds = roundMatchUps[2].map(({ matchUpId }) => matchUpId);
  result = tournamentEngine.bulkScheduleMatchUps({ matchUpIds, schedule });
  expect(result.success).toEqual(true);

  ({ matchUps } = competitionEngine.allCompetitionMatchUps({
    nextMatchUps: true,
  }));
  expect(Object.keys(matchUps[0].schedule).includes('scheduledDate')).toEqual(
    true
  );

  ({ roundMatchUps } = drawEngine.getRoundMatchUps({ matchUps }));
  roundMatchUps[1].forEach((firstRoundMatchUp) => {
    expect(firstRoundMatchUp.winnerTo.schedule.scheduleConflict).toEqual(true);
  });
  roundMatchUps[2].forEach((secondRoundMatchUp) =>
    expect(secondRoundMatchUp.schedule.scheduleConflict).toEqual(true)
  );

  ({ matchUps } = competitionEngine.allCompetitionMatchUps({
    nextMatchUps: true,
    scheduleVisibilityFilters: { visibilityThreshold },
  }));

  // visibilityThreshold has removed all schedule details except for time and milliseconds
  expect(Object.keys(matchUps[0].schedule).includes('scheduledDate')).toEqual(
    false
  );
  expect(Object.keys(matchUps[0].schedule).length).toEqual(2);

  const { participantIdsWithConflicts: ceConflicts } =
    competitionEngine.getCompetitionParticipants({ withStatistics: true });

  let { tournamentParticipants, participantIdsWithConflicts: teConflicts } =
    tournamentEngine.getTournamentParticipants({
      withStatistics: true,
      withMatchUps: true,
    });

  expect(ceConflicts.length).toEqual(16);
  expect(teConflicts.length).toEqual(16);

  const participantWithConflict = tournamentParticipants.find(
    ({ participantId }) => teConflicts.includes(participantId)
  );

  expect(
    participantWithConflict.potentialMatchUps[0].schedule.scheduleConflict
  ).toEqual(true);

  let { participantIdsWithConflicts } =
    competitionEngine.getCompetitionParticipants({
      scheduleAnalysis: { scheduledMinutesDifference: 60 },
      withStatistics: true,
    });

  expect(participantIdsWithConflicts.length).toEqual(16);

  ({ participantIdsWithConflicts } =
    competitionEngine.getCompetitionParticipants({
      scheduleAnalysis: { scheduledMinutesDifference: 50 },
      withStatistics: true,
    }));

  expect(participantIdsWithConflicts.length).toEqual(0);
});

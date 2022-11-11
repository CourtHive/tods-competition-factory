import { getStructureRoundProfile } from '../../../drawEngine/getters/getMatchUps/getStructureRoundProfile';
import { getMatchUpIds } from '../../../global/functions/extractors';
import competitionEngine from '../../../competitionEngine/sync';
import drawEngine from '../../../drawEngine/sync';
import mocksEngine from '../../../mocksEngine';
import { tournamentEngine } from '../../sync';

import POLICY_SCHEDULING_USTA from '../../../fixtures/policies/POLICY_SCHEDULING_USTA';
import SEEDING_ITF_POLICY from '../../../fixtures/policies/POLICY_SEEDING_ITF';
import { SINGLES_EVENT } from '../../../constants/eventConstants';
import {
  INVALID_DATE,
  INVALID_TIME,
  MISSING_MATCHUP_IDS,
  MISSING_SCHEDULE,
  VENUE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

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
    eventType: SINGLES_EVENT,
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
    policyDefinitions: { ...SEEDING_ITF_POLICY },
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

  result = tournamentEngine.bulkScheduleMatchUps({ schedule });
  expect(result.error).toEqual(MISSING_MATCHUP_IDS);

  result = tournamentEngine.bulkScheduleMatchUps({ matchUpIds });
  expect(result.error).toEqual(MISSING_SCHEDULE);

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
      eventType: SINGLES_EVENT,
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

  competitionEngine.attachPolicies({
    policyDefinitions: POLICY_SCHEDULING_USTA,
  });

  let { matchUps } = competitionEngine.allCompetitionMatchUps();
  let { roundMatchUps } = drawEngine.getRoundMatchUps({ matchUps });

  const scheduledDate = '2021-01-01';
  let schedule = {
    scheduledTime: '08:00',
    scheduledDate,
  };
  let matchUpIds = getMatchUpIds(roundMatchUps[1]);
  let result = tournamentEngine.bulkScheduleMatchUps({ matchUpIds, schedule });
  expect(result.success).toEqual(true);

  schedule = {
    scheduledTime: '09:00',
    scheduledDate,
  };
  matchUpIds = getMatchUpIds(roundMatchUps[2]);
  result = tournamentEngine.bulkScheduleMatchUps({ matchUpIds, schedule });
  expect(result.success).toEqual(true);

  ({ matchUps } = competitionEngine.allCompetitionMatchUps({
    afterRecoveryTimes: true,
    nextMatchUps: true,
  }));
  expect(Object.keys(matchUps[0].schedule).includes('scheduledDate')).toEqual(
    true
  );

  ({ roundMatchUps } = drawEngine.getRoundMatchUps({ matchUps }));
  roundMatchUps[1].forEach((firstRoundMatchUp) => {
    expect(typeof firstRoundMatchUp.winnerTo.schedule.scheduleConflict).toEqual(
      'string'
    );
  });
  roundMatchUps[2].forEach((secondRoundMatchUp) =>
    expect(typeof secondRoundMatchUp.schedule.scheduleConflict).toEqual(
      'string'
    )
  );

  ({ matchUps } = competitionEngine.allCompetitionMatchUps({
    scheduleVisibilityFilters: { visibilityThreshold },
    nextMatchUps: true,
  }));

  // visibilityThreshold has removed all schedule details except for time and milliseconds
  expect(Object.keys(matchUps[0].schedule).includes('scheduledDate')).toEqual(
    false
  );
  expect(Object.keys(matchUps[0].schedule).length).toEqual(2);

  const { participantIdsWithConflicts: ceConflicts } =
    competitionEngine.getCompetitionParticipants({
      scheduleAnalysis: true,
    });

  let { tournamentParticipants, participantIdsWithConflicts: teConflicts } =
    tournamentEngine.getTournamentParticipants({
      scheduleAnalysis: true,
      withMatchUps: true,
    });

  expect(ceConflicts.length).toEqual(16);
  expect(teConflicts.length).toEqual(16);

  let {
    participantIdsWithConflicts: gpConflicts,
    mappedMatchUps,
    participantMap,
  } = tournamentEngine.getParticipants({
    scheduleAnalysis: true,
  });
  expect(gpConflicts.length).toEqual(16);

  const participantWithConflict = tournamentParticipants.find(
    ({ participantId }) => teConflicts.includes(participantId)
  );

  expect(
    typeof participantWithConflict.potentialMatchUps[0].schedule
      .scheduleConflict
  ).toEqual('string');

  const targetParticipantId = participantWithConflict.participantId;
  expect(
    typeof mappedMatchUps[
      Object.keys(participantMap[targetParticipantId].potentialMatchUps)[0]
    ].schedule.scheduleConflict
  ).toEqual('string');

  let { participantIdsWithConflicts } =
    competitionEngine.getCompetitionParticipants({
      scheduleAnalysis: { scheduledMinutesDifference: 60 },
    });

  expect(participantIdsWithConflicts.length).toEqual(16);

  ({ participantIdsWithConflicts } =
    competitionEngine.getCompetitionParticipants({
      scheduleAnalysis: { scheduledMinutesDifference: 50 },
    }));

  expect(participantIdsWithConflicts.length).toEqual(0);

  ({ participantIdsWithConflicts: gpConflicts } =
    tournamentEngine.getParticipants({
      scheduleAnalysis: { scheduledMinutesDifference: 50 },
    }));
  expect(gpConflicts.length).toEqual(0);
});

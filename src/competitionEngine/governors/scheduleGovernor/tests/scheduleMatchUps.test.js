import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';

import { SUCCESS } from '../../../../constants/resultConstants';
import { OFFICIAL } from '../../../../constants/participantRoles';
import { INDIVIDUAL } from '../../../../constants/participantTypes';
import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  NO_MODIFICATIONS_APPLIED,
} from '../../../../constants/errorConditionConstants';

it('can add events, venues, and schedule matchUps', () => {
  const startDate = '2020-01-01';
  const endDate = '2020-01-06';

  const drawProfiles = [{ drawSize: 32 }];
  const dateAvailability = [
    {
      date: startDate,
      startTime: '07:00',
      endTime: '19:00',
      bookings: [
        { startTime: '07:00', endTime: '08:30', bookingType: 'PRACTICE' },
        { startTime: '08:30', endTime: '09:00', bookingType: 'MAINTENANCE' },
        { startTime: '13:30', endTime: '14:00', bookingType: 'MAINTENANCE' },
      ],
    },
  ];
  const venueProfiles = [
    {
      venueName: 'venue 1',
      startTime: '08:00',
      endTime: '20:00',
      courtsCount: 3,
      dateAvailability,
    },
  ];
  const {
    drawIds: [drawId],
    venueIds: [venueId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    startDate,
    endDate,
    drawProfiles,
    venueProfiles,
  });

  let result = competitionEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const { tournamentId } = tournamentRecord;

  const participant = {
    participantRole: OFFICIAL,
    participantType: INDIVIDUAL,
    person: {
      standardFamilyName: 'Family',
      standardGivenName: 'Given',
      extensions: [{ name: 'someExtension', value: 'extensionValue' }],
    },
    extensions: [{ name: 'anotherExtension', value: 'anotherExtensionValue' }],
  };

  result = competitionEngine.addParticipant({
    tournamentId: 'bogusId',
    participant,
  });
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORD);
  result = competitionEngine.addParticipant({ tournamentId, participant });
  expect(result.success).toEqual(true);
  const officialParticipantId = result.participant.participantId;

  const { courts, venues } = competitionEngine.getVenuesAndCourts();
  expect(courts.length).toEqual(3);
  expect(venues.length).toEqual(1);

  const { upcomingMatchUps: upcoming, pendingMatchUps } =
    competitionEngine.competitionMatchUps();
  expect(upcoming.length).toEqual(16);
  expect(pendingMatchUps.length).toEqual(15);

  const courtIds = courts.map((court) => court.courtId);
  const courtId = courtIds[0];
  let [matchUp] = upcoming;
  const { matchUpId } = matchUp;

  result = competitionEngine.assignMatchUpVenue({
    tournamentId,
    matchUpId,
    venueId,
    drawId,
  });
  expect(result).toEqual(SUCCESS);

  result = competitionEngine.assignMatchUpVenue({
    tournamentId,
    matchUpId,
    venueId: undefined,
    drawId,
  });
  expect(result).toEqual(SUCCESS);

  result = competitionEngine.assignMatchUpCourt({
    tournamentId,
    matchUpId,
    courtId,
    drawId,
    courtDayDate: startDate,
  });
  expect(result).toEqual(SUCCESS);

  result = competitionEngine.assignMatchUpCourt({
    tournamentId,
    matchUpId,
    courtId: undefined,
    drawId,
    courtDayDate: startDate,
  });
  expect(result).toEqual(SUCCESS);

  result = competitionEngine.addMatchUpScheduledDate({
    tournamentId,
    matchUpId,
    drawId,
    scheduledDate: startDate,
  });
  expect(result).toEqual(SUCCESS);

  const scheduledTime = '08:00';
  result = competitionEngine.addMatchUpScheduledTime({
    tournamentId,
    matchUpId,
    drawId,
    scheduledTime,
  });
  expect(result).toEqual(SUCCESS);

  const startTime = '08:00';
  result = competitionEngine.addMatchUpStartTime({
    tournamentId,
    matchUpId,
    drawId,
    startTime,
  });
  expect(result).toEqual(SUCCESS);

  const stopTime = `08:15`;
  result = competitionEngine.addMatchUpStopTime({
    tournamentId,
    matchUpId,
    drawId,
    stopTime,
  });
  expect(result).toEqual(SUCCESS);

  const resumeTime = '14:30';
  result = competitionEngine.addMatchUpResumeTime({
    tournamentId,
    matchUpId,
    drawId,
    resumeTime,
  });
  expect(result).toEqual(SUCCESS);

  const endTime = '15:45';
  result = competitionEngine.addMatchUpEndTime({
    tournamentId,
    matchUpId,
    drawId,
    endTime,
  });
  expect(result).toEqual(SUCCESS);

  result = competitionEngine.addMatchUpOfficial({
    tournamentId,
    matchUpId,
    drawId,
    participantId: officialParticipantId,
  });
  expect(result).toEqual(SUCCESS);

  let { upcomingMatchUps } = competitionEngine.competitionMatchUps();
  expect(upcomingMatchUps[0].timeItems.length).toEqual(12);

  result = competitionEngine.matchUpScheduleChange();
  expect(result.error).toEqual(MISSING_VALUE);

  result = competitionEngine.matchUpScheduleChange({
    sourceMatchUpContextIds: { drawId, matchUpId, tournamentId },
  });
  expect(result.error).toEqual(NO_MODIFICATIONS_APPLIED);

  result = competitionEngine.matchUpScheduleChange({
    sourceMatchUpContextIds: { drawId, matchUpId, tournamentId },
    targetCourtId: courtId,
  });
  expect(result.success).toEqual(true);

  ({ upcomingMatchUps } = competitionEngine.competitionMatchUps());
  expect(upcomingMatchUps[0].timeItems.length).toEqual(13);

  // duplicating the modification does NOT add a new timeItem
  result = competitionEngine.matchUpScheduleChange({
    sourceMatchUpContextIds: { drawId, matchUpId, tournamentId },
    targetCourtId: courtId,
  });
  expect(result.success).toEqual(true);

  ({ upcomingMatchUps } = competitionEngine.competitionMatchUps());
  expect(upcomingMatchUps[0].timeItems.length).toEqual(13);

  result = competitionEngine.assignMatchUpCourt({
    tournamentId,
    matchUpId: upcoming[1].matchUpId,
    courtId: courts[1].courtId,
    drawId,
    courtDayDate: startDate,
  });
  expect(result).toEqual(SUCCESS);

  result = competitionEngine.matchUpScheduleChange({
    sourceMatchUpContextIds: { drawId, matchUpId, tournamentId },
    targetMatchUpContextIds: {
      drawId,
      matchUpId: upcoming[1].matchUpId,
      tournamentId,
    },
    targetCourtId: courts[1].courtId,
    sourceCourtId: courtId,
  });
  expect(result.success).toEqual(true);

  ({ upcomingMatchUps } = competitionEngine.competitionMatchUps());
  expect(upcomingMatchUps[0].timeItems.length).toEqual(14);

  result = competitionEngine.removeMatchUpCourtAssignment({
    tournamentId,
    matchUpId,
    drawId,
  });

  ({ upcomingMatchUps } = competitionEngine.competitionMatchUps());
  expect(upcomingMatchUps[0].timeItems.length).toEqual(15);
});

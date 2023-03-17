import tournamentEngine from '../../../../tournamentEngine/sync';
import { hasSchedule } from '../scheduleMatchUps/hasSchedule';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';
import { expect, it } from 'vitest';

import { DISABLED } from '../../../../constants/extensionConstants';

it('can disable and enable courts and venues', () => {
  const startDate = '2022-09-24';
  const endDate = '2022-09-28';

  const venueProfiles = [
    { venueId: 'venueId1', courtsCount: 4 },
    { venueId: 'venueId2', courtsCount: 8 },
  ];
  let { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawId: 'drawId1', drawSize: 32 },
      { drawId: 'drawId2', drawSize: 32 },
    ],
    venueProfiles,
    startDate,
    endDate,
  });

  tournamentEngine.setState(tournamentRecord);

  const { rounds } = competitionEngine.getRounds();
  const draw1rounds = rounds.filter(({ drawId }) => drawId === 'drawId1');
  const draw2rounds = rounds.filter(({ drawId }) => drawId === 'drawId2');
  const schedulingProfile = [
    {
      scheduleDate: startDate,
      venues: [
        { venueId: 'venueId1', rounds: draw1rounds },
        { venueId: 'venueId2', rounds: draw2rounds },
      ],
    },
  ];

  let result = competitionEngine.setSchedulingProfile({ schedulingProfile });
  expect(result.success).toEqual(true);

  result = competitionEngine.scheduleProfileRounds();
  expect(result.success).toEqual(true);

  let { matchUps } = competitionEngine.allCompetitionMatchUps();
  let scheduledMatchUps = matchUps.filter(hasSchedule);
  expect(scheduledMatchUps.length).toBeGreaterThanOrEqual(50);
  result = competitionEngine.clearScheduledMatchUps();
  expect(result.success).toEqual(true);

  ({ matchUps } = competitionEngine.allCompetitionMatchUps());
  scheduledMatchUps = matchUps.filter(hasSchedule);
  expect(scheduledMatchUps.length).toEqual(0);

  result = competitionEngine.getVenuesAndCourts();
  expect([result.courts.length, result.venues.length]).toEqual([12, 2]);
  const courtIds = result.courts.map(({ courtId }) => courtId);

  result = competitionEngine.disableVenues({ venueIds: ['venueId1'] });
  expect(result.success).toEqual(true);
  tournamentRecord = tournamentEngine.getState().tournamentRecord;
  expect(tournamentRecord.venues[0].extensions[0].name).toEqual(DISABLED);
  result = competitionEngine.getVenuesAndCourts({ ignoreDisabled: true });
  expect([result.courts.length, result.venues.length]).toEqual([8, 1]);

  result = competitionEngine.enableVenues({ venueIds: ['venueId1'] });
  expect(result.success).toEqual(true);
  tournamentRecord = tournamentEngine.getState().tournamentRecord;
  expect(tournamentRecord.venues[0].extensions).toEqual([]);

  result = competitionEngine.disableVenues({ venueIds: ['venueId1'] });
  expect(result.success).toEqual(true);

  result = competitionEngine.scheduleProfileRounds();
  expect(result.success).toEqual(true);
  matchUps = competitionEngine.allCompetitionMatchUps().matchUps;
  scheduledMatchUps = matchUps.filter(hasSchedule);
  expect(scheduledMatchUps.length).toBeLessThan(40);

  result = competitionEngine.enableVenues({ enableAll: true });
  expect(result.success).toEqual(true);
  tournamentRecord = tournamentEngine.getState().tournamentRecord;
  expect(tournamentRecord.venues[0].extensions.length).toEqual(0);

  result = competitionEngine.clearScheduledMatchUps();
  expect(result.success).toEqual(true);
  ({ matchUps } = competitionEngine.allCompetitionMatchUps());
  scheduledMatchUps = matchUps.filter(hasSchedule);
  expect(scheduledMatchUps.length).toEqual(0);

  const targetCourtIds = courtIds.filter((_, i) => i % 2);
  result = competitionEngine.disableCourts({ courtIds: targetCourtIds });
  expect(result.success).toEqual(true);
  result = competitionEngine.getVenuesAndCourts({ ignoreDisabled: true });
  expect([result.courts.length, result.venues.length]).toEqual([12, 2]);

  result = competitionEngine.scheduleProfileRounds();
  expect(result.success).toEqual(true);
  matchUps = competitionEngine.allCompetitionMatchUps().matchUps;
  scheduledMatchUps = matchUps.filter(hasSchedule);
  expect(scheduledMatchUps.length).toBeLessThan(50);

  result = competitionEngine.getVenuesAndCourts();
  expect([result.courts.length, result.venues.length]).toEqual([12, 2]);
  let disabledCourts = result.courts.filter(
    (court) => court.extensions?.length
  );
  expect(disabledCourts.length).toEqual(6);

  result = competitionEngine.enableCourts({ enableAll: true });
  expect(result.success).toEqual(true);

  result = tournamentEngine.getVenuesAndCourts();
  expect([result.courts.length, result.venues.length]).toEqual([12, 2]);
  disabledCourts = result.courts.filter((court) => court.extensions?.length);
  expect(disabledCourts.length).toEqual(0);

  result.courts.forEach((court) =>
    expect(court.dateAvailability.length).toEqual(6)
  );

  result = competitionEngine.getVenuesAndCourts();
  expect([result.courts.length, result.venues.length]).toEqual([12, 2]);
  disabledCourts = result.courts.filter((court) => court.extensions?.length);
  expect(disabledCourts.length).toEqual(0);

  result.courts.forEach((court) =>
    expect(court.dateAvailability.length).toEqual(6)
  );

  result = competitionEngine.disableCourts({
    dates: [startDate, endDate],
    courtIds: targetCourtIds,
  });
  expect(result.success).toEqual(true);

  result = competitionEngine.getVenuesAndCourts({
    ignoreDisabled: true,
  });
  result.courts.forEach((court) => {
    if (targetCourtIds.includes(court.courtId)) {
      expect(court.dateAvailability.length).toEqual(3);
    } else {
      expect(court.dateAvailability.length).toEqual(6);
    }
  });

  result = tournamentEngine.getVenuesAndCourts({
    ignoreDisabled: true,
  });
  result.courts.forEach((court) => {
    if (targetCourtIds.includes(court.courtId)) {
      expect(court.dateAvailability.length).toEqual(3);
    } else {
      expect(court.dateAvailability.length).toEqual(6);
    }
  });

  // specifying a date with ignoreDisabled will filter out courts which have no dateAvailability for given date
  result = competitionEngine.getVenuesAndCourts({
    ignoreDisabled: true,
    dates: [startDate],
  });
  expect([result.courts.length, result.venues.length]).toEqual([6, 2]);

  // re-enable stardDate
  result = tournamentEngine.enableCourts({
    dates: [startDate],
    enableAll: true,
  });

  result = tournamentEngine.getVenuesAndCourts({
    ignoreDisabled: true,
  });
  result.courts.forEach((court) => {
    expect(court.dateAvailability.length).toEqual(4);
  });

  // re-enable endDate
  result = tournamentEngine.enableCourts({
    dates: [endDate],
    enableAll: true,
  });

  result = tournamentEngine.getVenuesAndCourts({
    ignoreDisabled: true,
  });

  result.courts.forEach((court) => {
    expect(court.dateAvailability.length).toEqual(5);
  });

  result = competitionEngine.disableCourts({
    courtIds: targetCourtIds,
    dates: [startDate],
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.getVenuesAndCourts({
    ignoreDisabled: true,
  });

  result.courts.forEach((court) => {
    expect(court.dateAvailability.length).toEqual(4);
  });

  // finally re-enable all courts
  result = tournamentEngine.enableCourts({ enableAll: true });
  expect(result.success).toEqual(true);

  result = tournamentEngine.getVenuesAndCourts({
    ignoreDisabled: true,
  });
  result.courts.forEach((court) => {
    expect(court.dateAvailability.length).toEqual(6);
  });
});

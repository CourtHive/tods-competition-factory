import { competitionEngine, mocksEngine, tournamentEngine } from '../../../..';
import { extractDate } from '../../../../utilities/dateTime';

test('varying court availability is properly considered', () => {
  expect(true);
  const drawId = 'drawId';
  const venueId = 'venueId';
  const startTime = '08:00';
  const endTime = '20:00';
  const startDate = extractDate(new Date().toISOString());
  const drawProfiles = [{ idPrefix: 'm', drawId, drawSize: 32 }];
  const venueProfiles = [
    {
      venueId,
      venueAbbreviation: 'VNU',
      courtsCount: 8,
      courtTimings: [{ startTime: '09:00' }, { endTime: '13:00' }],
      startTime,
      endTime,
    },
  ];

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    startDate,
    drawProfiles,
    venueProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  const { courts } = competitionEngine.getVenuesAndCourts();
  expect(courts[0].dateAvailability[0].startTime).toEqual('09:00');
  expect(courts[0].dateAvailability[0].endTime).toEqual('20:00');
  expect(courts[1].dateAvailability[0].startTime).toEqual('08:00');
  expect(courts[1].dateAvailability[0].endTime).toEqual('13:00');
  expect(courts[2].dateAvailability[0].startTime).toEqual('08:00');
  expect(courts[2].dateAvailability[0].endTime).toEqual('20:00');
});

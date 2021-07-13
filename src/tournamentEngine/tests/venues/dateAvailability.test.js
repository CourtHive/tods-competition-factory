import { validDateAvailability } from '../../governors/venueGovernor/dateAvailability';

test('will not allow saving of Invalid Date in dateAvailability', () => {
  let dateAvailability = [
    { date: '2021-01-02', startTime: '09:00', endTime: '16:00' },
  ];
  let result = validDateAvailability({ dateAvailability });
  expect(result.valid).toEqual(true);

  dateAvailability = [
    { date: 'Invalid Date', startTime: '09:00', endTime: '16:00' },
  ];
  result = validDateAvailability({ dateAvailability });
  expect(result.error).not.toBeUndefined();
});

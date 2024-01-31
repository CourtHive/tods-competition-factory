import { dateStringDaysChange } from '@Tools/dateTime';
import mocksEngine from '@Assemblies/engines/mock';
import { expect, test } from 'vitest';

import tournamentEngineSync from '@Engines/syncEngine';
import { INVALID_DATE, MISSING_EVENT } from '@Constants/errorConditionConstants';

test.each([tournamentEngineSync])('can modify event.startDate and event.endDate', async (tournamentEngine) => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  await tournamentEngine.setState(tournamentRecord);

  const newEvent = { eventName: 'Test Event' };
  const {
    event: { eventId, startDate: eventStartDate, endDate: eventEndDate },
    success,
  } = await tournamentEngine.addEvent({
    event: newEvent,
  });
  expect(success).toEqual(true);

  const { startDate, endDate } = tournamentRecord;
  expect(eventStartDate).toEqual(startDate);
  expect(eventEndDate).toEqual(endDate);

  const newEventStartDate = dateStringDaysChange(startDate, 1);
  let result = await tournamentEngine.setEventStartDate({
    startDate: newEventStartDate,
  });
  expect(result.error).toEqual(MISSING_EVENT);
  result = await tournamentEngine.setEventStartDate({
    eventId,
  });
  expect(result.error).toEqual(INVALID_DATE);
  result = await tournamentEngine.setEventStartDate({
    eventId,
    startDate: newEventStartDate,
  });
  expect(result.success).toEqual(true);
  let { event } = await tournamentEngine.getEvent({ eventId });
  expect(event.startDate).toEqual(newEventStartDate);

  const newEventEndDate = dateStringDaysChange(endDate, -1);
  result = await tournamentEngine.setEventEndDate({
    endDate: newEventEndDate,
  });
  expect(result.error).toEqual(MISSING_EVENT);
  result = await tournamentEngine.setEventEndDate({
    eventId,
  });
  expect(result.error).toEqual(INVALID_DATE);
  result = await tournamentEngine.setEventEndDate({
    eventId,
    endDate: newEventEndDate,
  });
  expect(result.success).toEqual(true);
  ({ event } = await tournamentEngine.getEvent({ eventId }));
  expect(event.endDate).toEqual(newEventEndDate);

  result = await tournamentEngine.setEventEndDate({
    eventId,
    endDate: startDate,
  });
  expect(result.success).toEqual(true);
});

test.each([tournamentEngineSync])(
  'will reject event.startDate and event.endDate if they fall outside of tournament dates',
  async (tournamentEngine) => {
    const { tournamentRecord } = mocksEngine.generateTournamentRecord();
    await tournamentEngine.setState(tournamentRecord);

    const newEvent = { eventName: 'Test Event' };
    const {
      event: { eventId, startDate: eventStartDate, endDate: eventEndDate },
      success,
    } = await tournamentEngine.addEvent({
      event: newEvent,
    });
    expect(success).toEqual(true);

    const { startDate, endDate } = tournamentRecord;
    expect(eventStartDate).toEqual(startDate);
    expect(eventEndDate).toEqual(endDate);

    const newEventStartDate = dateStringDaysChange(startDate, -1);
    let result = await tournamentEngine.setEventStartDate({
      eventId,
      startDate: newEventStartDate,
    });
    expect(result.success).toEqual(undefined);
    expect(result.error).toEqual(INVALID_DATE);
    let { event } = await tournamentEngine.getEvent({ eventId });
    expect(event.startDate).toEqual(eventStartDate);

    const newEventEndDate = dateStringDaysChange(endDate, 1);
    result = await tournamentEngine.setEventEndDate({
      eventId,
      endDate: newEventEndDate,
    });
    expect(result.success).toEqual(undefined);
    expect(result.error).toEqual(INVALID_DATE);
    ({ event } = await tournamentEngine.getEvent({ eventId }));
    expect(event.endDate).toEqual(eventEndDate);

    result = await tournamentEngine.setEventDates({
      eventId,
      startDate,
      endDate,
    });
    expect(result.success).toEqual(true);

    ({ event } = await tournamentEngine.getEvent({ eventId }));
    expect(event.startDate).toEqual(startDate);
    expect(event.endDate).toEqual(endDate);
  },
);

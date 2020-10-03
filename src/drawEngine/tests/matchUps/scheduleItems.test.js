import { generateFakeParticipants } from '../../../tournamentEngine/generators/fakerParticipants';
import { generateDrawStructure } from '../../tests/primitives/generateDrawStructure';

import { drawEngine } from '../../../drawEngine';

import { SUCCESS, ERROR } from '../../../constants/resultConstants';
import { PAIR } from '../../../constants/participantTypes';

it('can add schedule items', () => {
  const { participants } = generateFakeParticipants({
    participantsCount: 32,
    participantType: PAIR,
  });

  generateDrawStructure({
    drawSize: 32,
    participants,
    matchUpFormat: 'SET3-S:6/TB',
  });

  drawEngine.setParticipants(participants);
  const { matchUps } = drawEngine.allDrawMatchUps();
  let matchUp = matchUps[0];
  const { matchUpId } = matchUp;

  const scheduledDayDate = new Date('2020-01-01');
  let result = drawEngine.addMatchUpScheduledDayDate({
    matchUpId,
    scheduledDayDate,
  });
  expect(result).toEqual(SUCCESS);

  let {
    matchUp: { timeItems },
  } = drawEngine.findMatchUp({ matchUpId });
  expect(timeItems.length).toEqual(1);

  // TODO: should the scheduled time include the scheduled day?
  const scheduledTime = '8:00';
  result = drawEngine.addMatchUpScheduledTime({ matchUpId, scheduledTime });
  expect(result).toEqual(SUCCESS);

  let milliseconds, time, relevantTimeItems;
  let startTime, stopTime, resumeTime, endTime;

  // test matchUp duration with start and stop time
  startTime = new Date('2020-01-01T08:05:00Z');
  result = drawEngine.addMatchUpStartTime({ matchUpId, startTime });
  expect(result).toEqual(SUCCESS);

  endTime = new Date('2020-01-01T09:05:00Z');
  result = drawEngine.addMatchUpEndTime({ matchUpId, endTime });
  expect(result).toEqual(SUCCESS);

  ({ matchUp } = drawEngine.findMatchUp({ matchUpId }));

  ({ milliseconds, time, relevantTimeItems } = drawEngine.matchUpDuration({
    matchUp,
  }));
  expect(relevantTimeItems.length).toEqual(2);
  expect(milliseconds).toEqual(3600000);
  expect(time).toEqual('01:00:00');

  // now test matchDuration with start, stop, resume, end times
  result = drawEngine.resetTimeItems({ matchUpId });
  expect(result).toEqual(SUCCESS);

  startTime = new Date('2020-01-01T08:05:00Z');
  result = drawEngine.addMatchUpStartTime({ matchUpId, startTime });
  expect(result).toEqual(SUCCESS);

  stopTime = new Date('2020-01-01T08:15:00Z');
  result = drawEngine.addMatchUpStopTime({ matchUpId, stopTime });
  expect(result).toEqual(SUCCESS);

  resumeTime = new Date('2020-01-01T09:00:00Z');
  result = drawEngine.addMatchUpResumeTime({ matchUpId, resumeTime });
  expect(result).toEqual(SUCCESS);

  endTime = new Date('2020-01-01T10:00:00Z');
  result = drawEngine.addMatchUpEndTime({ matchUpId, endTime });
  expect(result).toEqual(SUCCESS);

  ({ matchUp } = drawEngine.findMatchUp({ matchUpId }));
  ({ milliseconds, time, relevantTimeItems } = drawEngine.matchUpDuration({
    matchUp,
  }));
  expect(relevantTimeItems.length).toEqual(4);
  expect(time).toEqual('01:10:00');
  expect(milliseconds).toEqual(4200000);

  const { schedule } = drawEngine.getMatchUpScheduleDetails({ matchUp });
  expect(schedule.time).toEqual('01:10:00');
  expect(schedule.milliseconds).toEqual(4200000);
  expect(schedule.startTime).toEqual('2020-01-01T08:05:00.000Z');

  // now test expected behaviors
  result = drawEngine.resetTimeItems({ matchUpId });
  expect(result).toEqual(SUCCESS);

  endTime = new Date('2020-01-01T10:00:00Z');
  result = drawEngine.addMatchUpEndTime({ matchUpId, endTime });
  expect(result).toEqual(SUCCESS);

  startTime = new Date('2020-01-01T08:00:00Z');
  result = drawEngine.addMatchUpStartTime({ matchUpId, startTime });
  expect(result).toEqual(SUCCESS);

  ({
    matchUp: { timeItems },
  } = drawEngine.findMatchUp({ matchUpId }));
  expect(timeItems.length).toEqual(2);

  // startTime should be replaced
  startTime = new Date('2020-01-01T08:30:00Z');
  result = drawEngine.addMatchUpStartTime({ matchUpId, startTime });
  expect(result).toEqual(SUCCESS);

  ({
    matchUp: { timeItems },
  } = drawEngine.findMatchUp({ matchUpId }));
  expect(timeItems.length).toEqual(2);

  // correct time should be calculated even though end was entered before start
  ({ matchUp } = drawEngine.findMatchUp({ matchUpId }));
  ({ milliseconds, time, relevantTimeItems } = drawEngine.matchUpDuration({
    matchUp,
  }));
  expect(relevantTimeItems.length).toEqual(2);
  expect(time).toEqual('01:30:00');
  expect(milliseconds).toEqual(5400000);

  // now test error conditions
  result = drawEngine.resetTimeItems({ matchUpId });
  expect(result).toEqual(SUCCESS);

  stopTime = new Date('2020-01-01T08:15:00Z');
  result = drawEngine.addMatchUpStopTime({ matchUpId, stopTime });
  expect(result).toHaveProperty(ERROR);

  resumeTime = new Date('2020-01-01T09:00:00Z');
  result = drawEngine.addMatchUpResumeTime({ matchUpId, resumeTime });
  expect(result).toHaveProperty(ERROR);

  // test adding end time after stop time
  result = drawEngine.resetTimeItems({ matchUpId });
  expect(result).toEqual(SUCCESS);

  startTime = new Date('2020-01-01T08:00:00Z');
  result = drawEngine.addMatchUpStartTime({ matchUpId, startTime });
  expect(result).toEqual(SUCCESS);

  stopTime = new Date('2020-01-01T08:15:00Z');
  result = drawEngine.addMatchUpStopTime({ matchUpId, stopTime });
  expect(result).toEqual(SUCCESS);

  endTime = new Date('2020-01-01T10:00:00Z');
  result = drawEngine.addMatchUpEndTime({ matchUpId, endTime });
  expect(result).toEqual(SUCCESS);

  // end time should be ignored since there is a stop time
  resumeTime = new Date('2020-01-01T09:00:00Z');
  result = drawEngine.addMatchUpResumeTime({ matchUpId, resumeTime });
  expect(result).toHaveProperty(ERROR);

  ({
    matchUp: { timeItems },
  } = drawEngine.findMatchUp({ matchUpId }));
  expect(timeItems.length).toEqual(3);

  ({ matchUp } = drawEngine.findMatchUp({ matchUpId }));
  ({ milliseconds, time, relevantTimeItems } = drawEngine.matchUpDuration({
    matchUp,
  }));
  expect(relevantTimeItems.length).toEqual(3);
  expect(time).toEqual('00:15:00');
  expect(milliseconds).toEqual(900000);
});

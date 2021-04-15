import { generateDrawStructure } from '../../tests/primitives/generateDrawStructure';
import { generateParticipants } from '../../../mocksEngine/generators/generateParticipants';
import { drawEngine } from '../../sync';

import { SUCCESS, ERROR } from '../../../constants/resultConstants';
import { PAIR } from '../../../constants/participantTypes';

it('can add schedule items', () => {
  const { participants } = generateParticipants({
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

  const scheduledDate = '2020-01-01';
  let result = drawEngine.addMatchUpScheduledDate({
    matchUpId,
    scheduledDate,
  });
  expect(result).toEqual(SUCCESS);

  let {
    matchUp: { timeItems },
  } = drawEngine.findMatchUp({ matchUpId });
  expect(timeItems.length).toEqual(1);

  // TODO: should the scheduled time include the scheduled day?
  const scheduledTime = '08:00';
  result = drawEngine.addMatchUpScheduledTime({ matchUpId, scheduledTime });
  expect(result).toEqual(SUCCESS);

  let milliseconds, time, relevantTimeItems;
  let startTime, stopTime, resumeTime, endTime;

  // test matchUp duration with start and stop time
  // startTime = '08:05';
  startTime = '2020-01-01T08:05:00Z';
  result = drawEngine.addMatchUpStartTime({ matchUpId, startTime });
  expect(result).toEqual(SUCCESS);

  // endTime = '09:05';
  endTime = '2020-01-01T09:05:00Z';
  result = drawEngine.addMatchUpEndTime({ matchUpId, endTime });
  expect(result).toEqual(SUCCESS);

  ({ matchUp } = drawEngine.findMatchUp({ matchUpId }));
  let { schedule } = drawEngine.getMatchUpScheduleDetails({ matchUp });
  expect(schedule.scheduledDate).toEqual('2020-01-01');
  expect(schedule.scheduledTime).toEqual('08:00');

  ({ milliseconds, time, relevantTimeItems } = drawEngine.matchUpDuration({
    matchUp,
  }));
  expect(relevantTimeItems.length).toEqual(2);
  expect(milliseconds).toEqual(3600000);
  expect(time).toEqual('01:00:00');

  // now test matchDuration with start, stop, resume, end times
  result = drawEngine.resetMatchUpTimeItems({ matchUpId });
  expect(result).toEqual(SUCCESS);

  startTime = '2020-01-01T08:05:00Z';
  result = drawEngine.addMatchUpStartTime({ matchUpId, startTime });
  expect(result).toEqual(SUCCESS);

  stopTime = '2020-01-01T08:15:00Z';
  result = drawEngine.addMatchUpStopTime({ matchUpId, stopTime });
  expect(result).toEqual(SUCCESS);

  resumeTime = '2020-01-01T09:00:00Z';
  result = drawEngine.addMatchUpResumeTime({ matchUpId, resumeTime });
  expect(result).toEqual(SUCCESS);

  endTime = '2020-01-01T10:00:00Z';
  result = drawEngine.addMatchUpEndTime({ matchUpId, endTime });
  expect(result).toEqual(SUCCESS);

  ({ matchUp } = drawEngine.findMatchUp({ matchUpId }));
  ({ milliseconds, time, relevantTimeItems } = drawEngine.matchUpDuration({
    matchUp,
  }));
  expect(relevantTimeItems.length).toEqual(4);
  expect(time).toEqual('01:10:00');
  expect(milliseconds).toEqual(4200000);

  ({ schedule } = drawEngine.getMatchUpScheduleDetails({ matchUp }));
  expect(schedule.time).toEqual('01:10:00');
  expect(schedule.milliseconds).toEqual(4200000);
  expect(schedule.startTime).toEqual(startTime);

  // now test expected behaviors
  result = drawEngine.resetMatchUpTimeItems({ matchUpId });
  expect(result).toEqual(SUCCESS);

  endTime = '2020-01-01T10:00:00Z';
  result = drawEngine.addMatchUpEndTime({ matchUpId, endTime });
  expect(result).toEqual(SUCCESS);

  startTime = '2020-01-01T08:00:00Z';
  result = drawEngine.addMatchUpStartTime({ matchUpId, startTime });
  expect(result).toEqual(SUCCESS);

  ({
    matchUp: { timeItems },
  } = drawEngine.findMatchUp({ matchUpId }));
  expect(timeItems.length).toEqual(2);

  // startTime should be replaced
  startTime = '2020-01-01T08:30:00Z';
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
  result = drawEngine.resetMatchUpTimeItems({ matchUpId });
  expect(result).toEqual(SUCCESS);

  stopTime = new Date('2020-01-01T08:15:00Z');
  result = drawEngine.addMatchUpStopTime({ matchUpId, stopTime });
  expect(result).toHaveProperty(ERROR);

  resumeTime = new Date('2020-01-01T09:00:00Z');
  result = drawEngine.addMatchUpResumeTime({ matchUpId, resumeTime });
  expect(result).toHaveProperty(ERROR);

  // test adding end time after stop time
  result = drawEngine.resetMatchUpTimeItems({ matchUpId });
  expect(result).toEqual(SUCCESS);

  startTime = '2020-01-01T08:00:00Z';
  result = drawEngine.addMatchUpStartTime({ matchUpId, startTime });
  expect(result).toEqual(SUCCESS);

  stopTime = '2020-01-01T08:15:00Z';
  result = drawEngine.addMatchUpStopTime({ matchUpId, stopTime });
  expect(result).toEqual(SUCCESS);

  endTime = '2020-01-01T10:00:00Z';
  result = drawEngine.addMatchUpEndTime({ matchUpId, endTime });
  expect(result).toEqual(SUCCESS);

  // end time should be ignored since there is a stop time
  resumeTime = '2020-01-01T09:00:00Z';
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

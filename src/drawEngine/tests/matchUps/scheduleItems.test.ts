import { drawEngine } from '../../sync';
import { mocksEngine } from '../../..';
import { expect, it } from 'vitest';

import { INVALID_TIME } from '../../../constants/errorConditionConstants';
import { DOUBLES } from '../../../constants/eventConstants';
import { ERROR } from '../../../constants/resultConstants';

const t200101_10 = '2020-01-01T10:00:00Z';
const t200101_9 = '2020-01-01T09:00:00Z';
const t200101_8 = '2020-01-01T08:15:00Z';

it('can add schedule items', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32, eventType: DOUBLES }],
  });
  const drawDefinition = tournamentRecord.events[0].drawDefinitions[0];
  const participants = tournamentRecord.participants;

  drawEngine.setState(drawDefinition);
  drawEngine.setParticipants(participants);
  const { matchUps } = drawEngine.allDrawMatchUps();
  let matchUp = matchUps[0];
  const { matchUpId } = matchUp;

  const scheduledDate = '2020-01-01';
  let result = drawEngine.addMatchUpScheduledDate({
    matchUpId,
    scheduledDate,
  });
  expect(result.success).toEqual(true);

  let {
    matchUp: { timeItems },
  } = drawEngine.findMatchUp({ matchUpId });
  expect(timeItems.length).toEqual(1);

  let scheduledTime = '2020-01-02T08:00';
  result = drawEngine.addMatchUpScheduledTime({ matchUpId, scheduledTime });
  expect(result.error).toEqual(INVALID_TIME);

  scheduledTime = '2020-01-01T08:00';
  result = drawEngine.addMatchUpScheduledTime({ matchUpId, scheduledTime });
  expect(result.success).toEqual(true);

  scheduledTime = '08:00';
  result = drawEngine.addMatchUpScheduledTime({ matchUpId, scheduledTime });
  expect(result.success).toEqual(true);

  let milliseconds, time, relevantTimeItems;
  let startTime, stopTime, resumeTime, endTime;

  // test matchUp duration with start and stop time
  startTime = '2020-01-01T08:05:00Z';
  result = drawEngine.addMatchUpStartTime({ matchUpId, startTime });
  expect(result.success).toEqual(true);

  endTime = '2020-01-01T09:05:00Z';
  result = drawEngine.addMatchUpEndTime({ matchUpId, endTime });
  expect(result.success).toEqual(true);

  ({ matchUp } = drawEngine.findMatchUp({ matchUpId }));
  let { schedule } = drawEngine.getMatchUpScheduleDetails({ matchUp });
  expect(schedule.scheduledDate).toEqual('2020-01-01');
  expect(schedule.scheduledTime).toEqual(scheduledTime);

  ({ milliseconds, time, relevantTimeItems } = drawEngine.matchUpDuration({
    matchUp,
  }));
  expect(relevantTimeItems.length).toEqual(2);
  expect(milliseconds).toEqual(3600000);
  expect(time).toEqual('01:00:00');

  // now test matchDuration with start, stop, resume, end times
  result = drawEngine.resetMatchUpTimeItems({ matchUpId });
  expect(result.success).toEqual(true);

  startTime = '2020-01-01T08:05:00Z';
  result = drawEngine.addMatchUpStartTime({ matchUpId, startTime });
  expect(result.success).toEqual(true);

  stopTime = t200101_8;
  result = drawEngine.addMatchUpStopTime({ matchUpId, stopTime });
  expect(result.success).toEqual(true);

  resumeTime = t200101_9;
  result = drawEngine.addMatchUpResumeTime({ matchUpId, resumeTime });
  expect(result.success).toEqual(true);

  endTime = t200101_10;
  result = drawEngine.addMatchUpEndTime({ matchUpId, endTime });
  expect(result.success).toEqual(true);

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
  expect(result.success).toEqual(true);

  endTime = t200101_10;
  result = drawEngine.addMatchUpEndTime({ matchUpId, endTime });
  expect(result.success).toEqual(true);

  startTime = '2020-01-01T08:00:00Z';
  result = drawEngine.addMatchUpStartTime({ matchUpId, startTime });
  expect(result.success).toEqual(true);

  ({
    matchUp: { timeItems },
  } = drawEngine.findMatchUp({ matchUpId }));
  expect(timeItems.length).toEqual(2);

  // startTime should be replaced
  startTime = '2020-01-01T08:30:00Z';
  result = drawEngine.addMatchUpStartTime({ matchUpId, startTime });
  expect(result.success).toEqual(true);

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
  expect(result.success).toEqual(true);

  stopTime = new Date(t200101_8);
  result = drawEngine.addMatchUpStopTime({ matchUpId, stopTime });
  expect(result).toHaveProperty(ERROR);

  resumeTime = new Date(t200101_9);
  result = drawEngine.addMatchUpResumeTime({ matchUpId, resumeTime });
  expect(result).toHaveProperty(ERROR);

  // test adding end time after stop time
  result = drawEngine.resetMatchUpTimeItems({ matchUpId });
  expect(result.success).toEqual(true);

  startTime = '2020-01-01T08:00:00Z';
  result = drawEngine.addMatchUpStartTime({ matchUpId, startTime });
  expect(result.success).toEqual(true);

  stopTime = t200101_8;
  result = drawEngine.addMatchUpStopTime({ matchUpId, stopTime });
  expect(result.success).toEqual(true);

  endTime = t200101_10;
  result = drawEngine.addMatchUpEndTime({ matchUpId, endTime });
  expect(result.success).toEqual(true);

  // end time should be ignored since there is a stop time
  resumeTime = t200101_9;
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

import { setSubscriptions } from '../../../global/state/globalState';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

it('can re-schedule matchUp date backwards and forwards in time', () => {
  const drawProfiles = [
    {
      participantsCount: 30,
      drawSize: 32,
    },
  ];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    inContext: true,
    drawProfiles,
  });
  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  expect(matchUps.length).toEqual(31);

  const matchUp = matchUps[0];
  const { drawId, matchUpId } = matchUp;

  const scheduledDate = '2020-01-03';
  let result = tournamentEngine.addMatchUpScheduledDate({
    scheduledDate,
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  let {
    matchUp: { schedule },
  } = tournamentEngine.findMatchUp({
    matchUpId,
    drawId,
  });
  expect(schedule.scheduledDate).toEqual(scheduledDate);

  const newScheduledDate = '2020-01-02';
  result = tournamentEngine.addMatchUpScheduledDate({
    scheduledDate: newScheduledDate,
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({
    matchUp: { schedule },
  } = tournamentEngine.findMatchUp({
    matchUpId,
    drawId,
  }));
  expect(schedule.scheduledDate).toEqual(newScheduledDate);

  result = tournamentEngine.addMatchUpScheduledDate({
    scheduledDate,
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({
    matchUp: { schedule },
  } = tournamentEngine.findMatchUp({
    matchUpId,
    drawId,
  }));
  expect(schedule.scheduledDate).toEqual(scheduledDate);

  result = tournamentEngine.addMatchUpScheduledDate({
    scheduledDate: undefined,
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({
    matchUp: { schedule },
  } = tournamentEngine.findMatchUp({
    matchUpId,
    drawId,
  }));
  expect(schedule.scheduledDate).toBeUndefined();

  const matchUpModifyNotices: any[] = [];
  const subscriptions = {
    modifyMatchUp: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ matchUp }) => {
          matchUpModifyNotices.push(matchUp);
        });
      }
    },
  };
  setSubscriptions({ subscriptions });

  const setStatusResult = tournamentEngine.setMatchUpStatus({
    schedule: { scheduledDate },
    matchUpId,
    drawId,
  });
  expect(setStatusResult.success).toEqual(true);
  expect(matchUpModifyNotices.length).toEqual(1);
});

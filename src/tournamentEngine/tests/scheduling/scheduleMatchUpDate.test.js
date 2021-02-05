import tournamentEngine from '../../sync';
import mocksEngine from '../../../mocksEngine';

import { SUCCESS } from '../../../constants/resultConstants';

it('can re-schedule matchUp date backwards and forwards in time', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
    },
  ];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });
  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  expect(matchUps.length).toEqual(31);

  const matchUp = matchUps[0];
  const { drawId, matchUpId } = matchUp;

  const scheduledDayDate = '2020-01-03';
  let result = tournamentEngine.addMatchUpScheduledDayDate({
    drawId,
    matchUpId,
    scheduledDayDate,
  });
  expect(result).toEqual(SUCCESS);

  let {
    matchUp: { schedule },
  } = tournamentEngine.findMatchUp({
    drawId,
    matchUpId,
  });
  expect(schedule.scheduledDate).toEqual(scheduledDayDate);

  const newScheduledDayDate = '2020-01-02';
  result = tournamentEngine.addMatchUpScheduledDayDate({
    drawId,
    matchUpId,
    scheduledDayDate: newScheduledDayDate,
  });
  expect(result).toEqual(SUCCESS);

  ({
    matchUp: { schedule },
  } = tournamentEngine.findMatchUp({
    drawId,
    matchUpId,
  }));
  expect(schedule.scheduledDate).toEqual(newScheduledDayDate);

  result = tournamentEngine.addMatchUpScheduledDayDate({
    drawId,
    matchUpId,
    scheduledDayDate,
  });
  expect(result).toEqual(SUCCESS);

  ({
    matchUp: { schedule },
  } = tournamentEngine.findMatchUp({
    drawId,
    matchUpId,
  }));
  expect(schedule.scheduledDate).toEqual(scheduledDayDate);

  result = tournamentEngine.addMatchUpScheduledDayDate({
    drawId,
    matchUpId,
    scheduledDayDate: undefined,
  });
  expect(result).toEqual(SUCCESS);

  ({
    matchUp: { schedule },
  } = tournamentEngine.findMatchUp({
    drawId,
    matchUpId,
  }));
  expect(schedule.scheduledDate).toBeUndefined();
});

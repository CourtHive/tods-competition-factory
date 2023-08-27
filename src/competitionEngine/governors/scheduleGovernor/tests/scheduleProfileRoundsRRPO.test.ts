import { shuffleArray, unique } from '../../../../utilities';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';
import { expect, it } from 'vitest';

import { SINGLES } from '../../../../constants/eventConstants';
import {
  PLAY_OFF,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../../../constants/drawDefinitionConstants';

it('will not schedule RR PLAY_OFF rounds before MAIN rounds', () => {
  const venueProfiles = [
    {
      venueName: 'venue 1',
      startTime: '08:00',
      endTime: '20:00',
      courtsCount: 8,
    },
  ];

  const eventProfiles = [
    {
      eventName: 'Event Test',
      eventType: SINGLES,
      drawProfiles: [
        {
          drawSize: 16,
          drawType: ROUND_ROBIN_WITH_PLAYOFF,
        },
      ],
    },
  ];
  const startDate = '2022-01-01';
  const endDate = '2022-01-07';
  const {
    venueIds: [venueId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    eventProfiles,
    venueProfiles,
    startDate,
    endDate,
  });

  competitionEngine.setState(tournamentRecord);

  const { rounds: derivedRounds } = competitionEngine.getRounds();

  // even if the rounds are shuffled to be "out of order" the test will still work
  const rounds = shuffleArray(derivedRounds);

  const schedulingProfile = [
    { scheduleDate: startDate, venues: [{ venueId, rounds }] },
  ];

  let result = competitionEngine.validateSchedulingProfile({
    schedulingProfile,
  });
  expect(result.valid).toEqual(true);

  result = competitionEngine.setSchedulingProfile({ schedulingProfile });
  expect(result.success).toEqual(true);

  result = competitionEngine.getSchedulingProfileIssues();
  expect(result.success).toEqual(true);

  result = competitionEngine.getMatchUpDependencies();
  const matchUpDependencies: any[] = Object.values(result.positionDependencies);
  expect(matchUpDependencies.length).toEqual(1);
  // Round Robin of 4x4 produces 24 matchUps
  expect(matchUpDependencies[0].length).toEqual(24);

  const { matchUps } = competitionEngine.allCompetitionMatchUps();
  expect(matchUps.length).toEqual(27);

  result = competitionEngine.scheduleProfileRounds();
  const scheduledMatchUpIds = result.scheduledMatchUpIds[startDate];
  expect(scheduledMatchUpIds.length).toEqual(27);

  const dependencyDeferredMatchUpIds = Object.keys(
    result.dependencyDeferredMatchUpIds[startDate]
  );
  // this is the most important test of all.  Scheduling of the 3 PLAY_OFF matchUps was deferred until all dependencies were resolved.
  expect(dependencyDeferredMatchUpIds.length).toEqual(3);
  const dependencyDefferredMatchUps = matchUps.filter(({ matchUpId }) =>
    dependencyDeferredMatchUpIds.includes(matchUpId)
  );
  expect(unique(dependencyDefferredMatchUps.map(({ stage }) => stage))).toEqual(
    [PLAY_OFF]
  );

  const matchUpScheduleTimes = result.matchUpScheduleTimes;
  expect(Object.keys(matchUpScheduleTimes).length).toEqual(27);

  const targetMatchUpIds = Object.keys(matchUpScheduleTimes).slice(24);
  const targetMatchUps = matchUps.filter(({ matchUpId }) =>
    targetMatchUpIds.includes(matchUpId)
  );

  expect(unique(targetMatchUps.map(({ stage }) => stage))).toEqual([PLAY_OFF]);
});

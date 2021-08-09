import competitionEngine from '../../../competitionEngine/sync';
import drawEngine from '../../../drawEngine/sync';
import mocksEngine from '../../../mocksEngine';
import { tournamentEngine } from '../../sync';

import { eventConstants } from '../../../constants/eventConstants';

import POLICY_SCHEDULING_USTA from '../../../fixtures/policies/POLICY_SCHEDULING_USTA';

const { SINGLES } = eventConstants;

test('recognizes scheduling conflicts', () => {
  const visibilityThreshold = Date.now();

  const eventProfiles = [
    {
      eventName: 'Event  Test',
      eventType: SINGLES,
      drawProfiles: [
        {
          drawSize: 16,
        },
      ],
    },
  ];
  const startDate = '2022-01-01';
  const endDate = '2022-01-07';
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    eventProfiles,
    startDate,
    endDate,
  });

  competitionEngine.setState(tournamentRecord);

  competitionEngine.attachPolicy({
    policyDefinition: POLICY_SCHEDULING_USTA,
  });

  let { matchUps } = competitionEngine.allCompetitionMatchUps();
  let { roundMatchUps } = drawEngine.getRoundMatchUps({ matchUps });

  const scheduledDate = '2021-01-01';
  let schedule = {
    scheduledTime: '08:00',
    scheduledDate,
  };
  let matchUpIds = roundMatchUps[1].map(({ matchUpId }) => matchUpId);
  let result = tournamentEngine.bulkScheduleMatchUps({ matchUpIds, schedule });
  expect(result.success).toEqual(true);

  schedule = {
    scheduledTime: '09:00',
    scheduledDate,
  };
  matchUpIds = roundMatchUps[2].map(({ matchUpId }) => matchUpId);
  result = tournamentEngine.bulkScheduleMatchUps({ matchUpIds, schedule });
  expect(result.success).toEqual(true);

  ({ matchUps } = competitionEngine.allCompetitionMatchUps({
    nextMatchUps: true,
  }));
  expect(Object.keys(matchUps[0].schedule).includes('scheduledDate')).toEqual(
    true
  );

  ({ roundMatchUps } = drawEngine.getRoundMatchUps({ matchUps }));
  roundMatchUps[1].forEach((firstRoundMatchUp) => {
    expect(firstRoundMatchUp.winnerTo.schedule.scheduleConflict).toEqual(true);
  });
  roundMatchUps[2].forEach((secondRoundMatchUp) =>
    expect(secondRoundMatchUp.schedule.scheduleConflict).toEqual(true)
  );

  ({ matchUps } = competitionEngine.allCompetitionMatchUps({
    nextMatchUps: true,
    scheduleVisibilityFilters: { visibilityThreshold },
  }));

  // visibilityThreshold has removed all schedule details except for time and milliseconds
  expect(Object.keys(matchUps[0].schedule).includes('scheduledDate')).toEqual(
    false
  );
  expect(Object.keys(matchUps[0].schedule).length).toEqual(2);

  const { participantIdsWithConflicts: ceConflicts } =
    competitionEngine.getCompetitionParticipants({ withStatistics: true });

  const { tournamentParticipants, participantIdsWithConflicts: teConflicts } =
    tournamentEngine.getTournamentParticipants({
      withStatistics: true,
      withMatchUps: true,
    });

  expect(ceConflicts.length).toEqual(16);
  expect(teConflicts.length).toEqual(16);

  const participantWithConflict = tournamentParticipants.find(
    ({ participantId }) => teConflicts.includes(participantId)
  );

  expect(
    participantWithConflict.potentialMatchUps[0].schedule.scheduleConflict
  ).toEqual(true);
});

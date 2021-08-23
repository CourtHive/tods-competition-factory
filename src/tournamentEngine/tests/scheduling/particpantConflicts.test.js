import competitionEngine from '../../../competitionEngine/sync';
import drawEngine from '../../../drawEngine/sync';
import mocksEngine from '../../../mocksEngine';
import { tournamentEngine } from '../../sync';
import fs from 'fs';

import POLICY_SCHEDULING_USTA from '../../../fixtures/policies/POLICY_SCHEDULING_USTA';
import { eventConstants } from '../../../constants/eventConstants';

const { SINGLES, DOUBLES } = eventConstants;

test('recognizes scheduling conflicts', () => {
  const venueProfiles = [{ courtsCount: 6 }];
  const eventProfiles = [
    {
      eventType: SINGLES,
      drawProfiles: [
        {
          drawSize: 16,
        },
      ],
    },
    {
      eventType: DOUBLES,
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
    venueProfiles,
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

  let { tournamentParticipants, participantIdsWithConflicts } =
    tournamentEngine.getTournamentParticipants({
      withStatistics: true,
      withMatchUps: true,
    });

  expect(participantIdsWithConflicts.length).toEqual(16);

  const participantWithConflict = tournamentParticipants.find(
    ({ participantId }) => participantIdsWithConflicts.includes(participantId)
  );

  expect(
    participantWithConflict.potentialMatchUps[0].schedule.scheduleConflict
  ).toEqual(true);

  ({ tournamentParticipants, participantIdsWithConflicts } =
    competitionEngine.getCompetitionParticipants({
      scheduleAnalysis: { scheduledMinutesDifference: 60 },
      withStatistics: true,
    }));

  fs.writeFileSync(
    'tp.json',
    JSON.stringify(tournamentParticipants, undefined, 2)
  );

  expect(participantIdsWithConflicts.length).toEqual(16);

  ({ participantIdsWithConflicts } =
    competitionEngine.getCompetitionParticipants({
      scheduleAnalysis: { scheduledMinutesDifference: 50 },
      withStatistics: true,
    }));

  expect(participantIdsWithConflicts.length).toEqual(0);
});

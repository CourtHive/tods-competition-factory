import { getMatchUpIds } from '../../../global/functions/extractors';
import competitionEngine from '../../../competitionEngine/sync';
import drawEngine from '../../../drawEngine/sync';
import mocksEngine from '../../../mocksEngine';
import { tournamentEngine } from '../../sync';

import POLICY_SCHEDULING_USTA from '../../../fixtures/policies/POLICY_SCHEDULING_USTA';
import { INDIVIDUAL } from '../../../constants/participantConstants';
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
  const { eventIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    venueProfiles,
    eventProfiles,
    startDate,
    endDate,
  });

  competitionEngine.setState(tournamentRecord);

  competitionEngine.attachPolicies({
    policyDefinitions: POLICY_SCHEDULING_USTA,
  });

  let { matchUps } = competitionEngine.allCompetitionMatchUps({
    matchUpFilters: { eventIds: [eventIds[0]] },
  });
  let { roundMatchUps } = drawEngine.getRoundMatchUps({ matchUps });

  const scheduledDate = '2021-01-01';
  let schedule = {
    scheduledTime: '08:00',
    scheduledDate,
  };
  let matchUpIds = getMatchUpIds(roundMatchUps[1]);
  let result = tournamentEngine.bulkScheduleMatchUps({ matchUpIds, schedule });
  expect(result.success).toEqual(true);

  schedule = {
    scheduledTime: '09:00',
    scheduledDate,
  };
  matchUpIds = getMatchUpIds(roundMatchUps[2]);
  result = tournamentEngine.bulkScheduleMatchUps({ matchUpIds, schedule });
  expect(result.success).toEqual(true);

  ({ matchUps } = competitionEngine.allCompetitionMatchUps({
    matchUpFilters: { eventIds: [eventIds[0]] },
    nextMatchUps: true,
  }));
  expect(Object.keys(matchUps[0].schedule).includes('scheduledDate')).toEqual(
    true
  );

  ({ roundMatchUps } = drawEngine.getRoundMatchUps({ matchUps }));
  roundMatchUps[1].forEach((firstRoundMatchUp) => {
    expect(typeof firstRoundMatchUp.winnerTo.schedule.scheduleConflict).toEqual(
      'string'
    );
  });
  roundMatchUps[2].forEach((secondRoundMatchUp) =>
    expect(typeof secondRoundMatchUp.schedule.scheduleConflict).toEqual(
      'string'
    )
  );

  let { tournamentParticipants, participantIdsWithConflicts } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
      scheduleAnalysis: true,
      withStatistics: true,
      withMatchUps: true,
    });

  expect(participantIdsWithConflicts.length).toEqual(16);

  const participantWithConflict = tournamentParticipants.find(
    ({ participantId }) => participantIdsWithConflicts.includes(participantId)
  );

  expect(
    typeof participantWithConflict.potentialMatchUps[0].schedule
      .scheduleConflict
  ).toEqual('string');

  let competitionParticipants;
  ({ competitionParticipants, participantIdsWithConflicts } =
    competitionEngine.getCompetitionParticipants({
      scheduleAnalysis: { scheduledMinutesDifference: 60 },
      withStatistics: true,
    }));

  expect(participantIdsWithConflicts.length).toEqual(16);

  ({ participantIdsWithConflicts } =
    competitionEngine.getCompetitionParticipants({
      scheduleAnalysis: { scheduledMinutesDifference: 50 },
      withStatistics: true,
    }));

  expect(participantIdsWithConflicts.length).toEqual(0);

  expect(competitionParticipants[0].scheduleConflicts.length).toEqual(1);
  expect(
    typeof competitionParticipants[0].scheduleConflicts[0]
      .priorScheduledMatchUpId
  ).toEqual('string');
  expect(
    typeof competitionParticipants[0].scheduleConflicts[0].matchUpIdWithConflict
  ).toEqual('string');
});

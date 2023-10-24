import { getMatchUpIds } from '../../../global/functions/extractors';
import { eventConstants } from '../../../constants/eventConstants';
import competitionEngine from '../../../competitionEngine/sync';
import drawEngine from '../../../drawEngine/sync';
import mocksEngine from '../../../mocksEngine';
import { tournamentEngine } from '../../sync';
import { expect, test } from 'vitest';

import POLICY_SCHEDULING_USTA from '../../../fixtures/policies/POLICY_SCHEDULING_USTA';
import { INDIVIDUAL } from '../../../constants/participantConstants';

const { SINGLES, DOUBLES } = eventConstants;

test('recognizes scheduling conflicts', () => {
  const venueProfiles = [{ courtsCount: 6 }];
  const eventProfiles = [
    {
      drawProfiles: [{ idPrefix: 'd1', drawSize: 16 }],
      eventType: SINGLES,
    },
    {
      drawProfiles: [{ idPrefix: 'd2', drawSize: 16 }],
      eventType: DOUBLES,
    },
  ];
  const startDate = '2022-01-01';
  const endDate = '2022-01-07';
  const { eventIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { idPrefix: 'xyz' },
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
    contextFilters: { eventIds: [eventIds[0]] },
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
    contextFilters: { eventIds: [eventIds[0]] },
    afterRecoveryTimes: true,
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
  roundMatchUps[2].forEach((secondRoundMatchUp) => {
    expect(
      typeof secondRoundMatchUp.winnerTo.schedule.scheduleConflict === 'string'
    ).toEqual(false);
  });

  const pp = tournamentEngine.getParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
    scheduleAnalysis: true,
    withStatistics: true,
    withMatchUps: true,
  });

  expect(pp.participantIdsWithConflicts.length).toEqual(16);

  const ppWithConflict = pp.participants.find(({ participantId }) =>
    pp.participantIdsWithConflicts.includes(participantId)
  );
  const firstPotential =
    pp.mappedMatchUps[ppWithConflict.potentialMatchUps[0].matchUpId];
  expect(firstPotential.schedule.scheduleConflict.startsWith('d1-1')).toEqual(
    true
  );

  const { competitionParticipants, participantIdsWithConflicts } =
    competitionEngine.getCompetitionParticipants({
      scheduleAnalysis: { scheduledMinutesDifference: 60 },
      withStatistics: true,
    });

  expect(participantIdsWithConflicts.length).toEqual(16);
  expect(competitionParticipants[0].scheduleConflicts.length).toEqual(1);
  expect(
    typeof competitionParticipants[0].scheduleConflicts[0]
      .priorScheduledMatchUpId
  ).toEqual('string');
  expect(
    typeof competitionParticipants[0].scheduleConflicts[0].matchUpIdWithConflict
  ).toEqual('string');

  result = competitionEngine.getParticipants({
    scheduleAnalysis: { scheduledMinutesDifference: 60 },
    withPotentialMatchUps: true,
    withStatistics: true,
  });

  expect(result.participantIdsWithConflicts.length).toEqual(16);

  const targetParticipant = result.participants.find(
    ({ participantId }) =>
      participantId === competitionParticipants[0].participantId
  );
  // TODO: why is there duplication here
  expect(targetParticipant.scheduleConflicts.length).toEqual(2);
  expect(targetParticipant.potentialMatchUps.length).toEqual(2);

  const cp = competitionEngine.getCompetitionParticipants({
    scheduleAnalysis: { scheduledMinutesDifference: 50 },
    withStatistics: true,
  });

  expect(cp.participantIdsWithConflicts.length).toEqual(0);
});

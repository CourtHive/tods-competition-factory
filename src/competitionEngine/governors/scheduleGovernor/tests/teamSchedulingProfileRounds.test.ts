import tournamentEngine from '../../../../tournamentEngine/sync';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';
import { expect, it } from 'vitest';

import { DOMINANT_DUO } from '../../../../constants/tieFormatConstants';
import { DOUBLES, SINGLES } from '../../../../constants/matchUpTypes';
import { TEAM } from '../../../../constants/eventConstants';

it('can return participant scheduled matchUps', () => {
  const startDate = '2023-06-26';
  const endDate = '2023-06-28';

  const venueProfiles = [{ courtsCount: 4 }];
  const {
    tournamentRecord,
    venueIds: [venueId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawSize: 8, eventType: TEAM, tieFormatName: DOMINANT_DUO },
    ],
    venueProfiles,
    startDate,
    endDate,
  });

  tournamentEngine.setState(tournamentRecord);

  const { rounds } = competitionEngine.getRounds();
  const schedulingProfile = [
    { scheduleDate: startDate, venues: [{ venueId, rounds }] },
  ];

  let result = competitionEngine.setSchedulingProfile({ schedulingProfile });
  expect(result.success).toEqual(true);

  result = competitionEngine.scheduleProfileRounds();
  expect(result.success).toEqual(true);

  const { matchUps } = competitionEngine.allCompetitionMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES, DOUBLES] },
  });
  expect(matchUps.every(({ schedule }) => schedule.scheduledTime)).toEqual(
    true
  );
});

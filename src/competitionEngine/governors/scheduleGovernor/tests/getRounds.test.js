import { mocksEngine } from '../../../../mocksEngine';
import { competitionEngine } from '../../../sync';
import { expect, it } from 'vitest';

import { MISSING_TOURNAMENT_RECORDS } from '../../../../constants/errorConditionConstants';
import {
  CURTIS_CONSOLATION,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../../../constants/drawDefinitionConstants';

it('can generate tournament rounds', () => {
  let result = competitionEngine.getRounds();
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORDS);

  const startDate = '2022-02-02';
  const venueProfiles = [
    {
      venueId: 'venueId',
      venueName: 'Club Courts',
      venueAbbreviation: 'CC',
      startTime: '08:00',
      endTime: '20:00',
      courtsCount: 6,
    },
  ];
  const drawProfiles = [
    { drawId: 'd1', drawSize: 16, drawType: ROUND_ROBIN_WITH_PLAYOFF },
    { drawId: 'd2', drawSize: 32, drawType: CURTIS_CONSOLATION },
  ];

  const schedulingProfile = [
    {
      scheduleDate: startDate,
      venues: [
        {
          venueId: venueProfiles[0].venueId,
          rounds: [
            { drawId: 'd2', winnerFinishingPositionRange: '1-16' },
            { drawId: 'd2', winnerFinishingPositionRange: '1-8' },
          ],
        },
      ],
    },
  ];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    schedulingProfile,
    venueProfiles,
    drawProfiles,
    startDate,
  });

  competitionEngine.setState(tournamentRecord);
  result = competitionEngine.getRounds();
  expect(result.success).toEqual(true);
  expect(result.rounds.length).toEqual(18);

  const { profileRounds } = competitionEngine.getProfileRounds();
  expect(profileRounds.length).toEqual(2);
});

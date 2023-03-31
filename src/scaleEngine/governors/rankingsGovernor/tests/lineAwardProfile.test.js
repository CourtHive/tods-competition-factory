import tournamentEngine from '../../../../tournamentEngine/sync';
import { finishingPositionSort } from './awardTestUtils';
import mocksEngine from '../../../../mocksEngine';
import { expect, it } from 'vitest';

import { TEAM_EVENT } from '../../../../constants/eventConstants';

it('generates points for lines in team matchUps', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    eventProfiles: [
      {
        drawProfiles: [{ drawSize: 8 }],
        eventType: TEAM_EVENT,
      },
    ],
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const participants = tournamentEngine
    .getParticipants({
      withRankingProfile: true,
      // withMatchUps: true,
    })
    .participants.sort(finishingPositionSort);

  console.log({ participants });
});

import { getAwardProfile } from '@Query/scales/getAwardProfile';
import { awardProfileLevelLines } from './awardProfileExamples';
import tournamentEngine from '@Engines/syncEngine';
import { finishingPositionSort } from './awardTestUtils';
import scaleEngine from '@Engines/scaleEngine';
import { mocksEngine } from '../../..';
import { expect, it } from 'vitest';

import { POLICY_TYPE_RANKING_POINTS } from '@Constants/policyConstants';
import { TEAM_PARTICIPANT } from '@Constants/participantConstants';
import { TEAM_EVENT } from '@Constants/eventConstants';

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
      participantFilters: { participantTypes: [TEAM_PARTICIPANT] },
      withRankingProfile: true,
    })
    .participants.sort(finishingPositionSort);

  const participation = participants[0].draws[0].structureParticipation;

  const awardCriteria = {
    eventType: TEAM_EVENT,
    participation,
  };

  const awardProfiles = [awardProfileLevelLines];
  const { awardProfile } = getAwardProfile({ awardProfiles, ...awardCriteria });
  expect(awardProfile).not.toBeUndefined();

  const policyDefinitions = { [POLICY_TYPE_RANKING_POINTS]: { awardProfiles } };

  result = scaleEngine.getTournamentPoints({ policyDefinitions, level: 1 });
  expect(result.success).toEqual(true);
});

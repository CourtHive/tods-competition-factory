import { mocksEngine, scaleEngine, tournamentEngine } from '../../../..';
import { awardProfileLevelLines } from './awardProfileExamples';
import { finishingPositionSort } from './awardTestUtils';
import { getAwardProfile } from '../getAwardProfile';
import { expect, it } from 'vitest';

import { POLICY_TYPE_RANKING_POINTS } from '../../../../constants/policyConstants';
import { TEAM_PARTICIPANT } from '../../../../constants/participantConstants';
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

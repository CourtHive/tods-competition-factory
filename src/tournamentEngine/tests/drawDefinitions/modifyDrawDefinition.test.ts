import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { AD_HOC } from '../../../constants/drawDefinitionConstants';
import { POLICY_TYPE_ROUND_NAMING } from '../../../constants/policyConstants';
import { APPLIED_POLICIES } from '../../../constants/extensionConstants';

it('can modify drawDefinition round naming policy', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawType: AD_HOC,
        automated: true,
        roundsCount: 1,
        drawSize: 16,
      },
    ],
    participantsProfile: { idPrefix: 'P' },
  });

  tournamentEngine.setState(tournamentRecord);

  let matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  expect(matchUps.length).toEqual(8);
  expect(matchUps[0].abbreviatedRoundName).toEqual('R1');
  expect(matchUps[0].roundName).toEqual('Round 1');

  const policyName = 'League Ad Hoc';
  const customRoundNamingPolicy = {
    [POLICY_TYPE_ROUND_NAMING]: {
      namingConventions: { round: 'Week' },
      affixes: { roundNumber: 'W' },
      policyName,
    },
  };

  const result = tournamentEngine.modifyDrawDefinition({
    drawUpdates: { policyDefinitions: { ...customRoundNamingPolicy } },
    drawName: 'League Play',
    drawId,
  });
  expect(result.success).toEqual(true);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(
    drawDefinition.extensions.find(({ name }) => name === APPLIED_POLICIES)
      .value[POLICY_TYPE_ROUND_NAMING].policyName
  ).toEqual(policyName);
  matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  expect(matchUps[0].abbreviatedRoundName).toEqual('W1');
  expect(matchUps[0].roundName).toEqual('Week 1');
});

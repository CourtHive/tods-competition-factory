import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { AD_HOC, WIN_RATIO } from '../../../constants/drawDefinitionConstants';
import POLICY_SEEDING_ITF from '../../../fixtures/policies/POLICY_SEEDING_ITF';
import { APPLIED_POLICIES } from '../../../constants/extensionConstants';

it('can generate AD_HOC drawDefinitions', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32, drawType: AD_HOC }],
    policyDefinitions: { ...POLICY_SEEDING_ITF },
  });

  tournamentEngine.setState(tournamentRecord);
  expect(tournamentRecord.extensions.length).toEqual(1);
  expect(tournamentRecord.extensions[0].name).toEqual(APPLIED_POLICIES);
  expect(tournamentRecord.extensions[0].value.seeding).not.toBeUndefined();

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.structures.length).toEqual(1);
  expect(drawDefinition.structures[0].finishingPosition).toEqual(WIN_RATIO);

  expect(drawDefinition.extensions.length).toEqual(1);
  expect(drawDefinition.extensions[0].name).toEqual('entryProfile');
});

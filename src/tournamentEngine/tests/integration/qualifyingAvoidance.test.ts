import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { POLICY_TYPE_AVOIDANCE } from '../../../constants/policyConstants';

it('properly handles qualifiers with avoidances', () => {
  const avoidancePolicy = {
    policyAttributes: [
      { key: 'individualParticipants.person.addresses.country' },
      { key: 'person.addresses.country' },
    ],
  };
  const policyDefinitions = { [POLICY_TYPE_AVOIDANCE]: avoidancePolicy };
  const qualifiersCount = 8;
  const drawProfiles = [
    {
      qualifiersCount,
      drawSize: 64,
    },
  ];

  const result = mocksEngine.generateTournamentRecord({
    policyDefinitions,
    drawProfiles,
  });
  expect(result.success).toEqual(true);

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = result;

  tournamentEngine.setState(tournamentRecord);
  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(
    drawDefinition.structures[0].positionAssignments.every(
      ({ participantId, qualifier }) => participantId || qualifier
    )
  ).toEqual(true);
  expect(
    drawDefinition.structures[0].positionAssignments.filter(
      ({ qualifier }) => qualifier
    ).length
  ).toEqual(qualifiersCount);
});

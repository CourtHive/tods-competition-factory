import mocksEngine from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { expect, it } from 'vitest';

import { POLICY_TYPE_AVOIDANCE } from '@Constants/policyConstants';
import { MAIN } from '@Constants/drawDefinitionConstants';
import { getConflicts } from './testGetConflicts';

it('properly handles qualifiers with avoidances', () => {
  const keyToTest = 'person.addresses.countryCode';
  const keysToTest = [{ key: keyToTest }];

  const avoidancePolicy = { policyAttributes: keysToTest };
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
      ({ participantId, qualifier }) => participantId || qualifier,
    ),
  ).toEqual(true);
  expect(drawDefinition.structures[0].positionAssignments.filter(({ qualifier }) => qualifier).length).toEqual(
    qualifiersCount,
  );

  const mainStructureId = drawDefinition.structures.find((structure) => structure.stage === MAIN).structureId;

  const { conflicts } = getConflicts({
    tournamentRecord: tournamentEngine.getTournament().tournamentRecord,
    structureId: mainStructureId,
    keysToTest,
    drawId,
  });
  expect(conflicts?.length).toEqual(0);
});

import { generateDrawTypeAndModifyDrawDefinition } from '../../../../assemblies/generators/drawDefinitions/generateDrawTypeAndModifyDrawDefinition';
import { initializeStructureSeedAssignments } from '../../../../mutate/drawDefinitions/positionGovernor/initializeSeedAssignments';
import { newDrawDefinition } from '../../../../assemblies/generators/drawDefinitions/newDrawDefinition';
import { setStageDrawSize } from '../../../../mutate/drawDefinitions/entryGovernor/stageEntryCounts';
import { addDrawEntries } from '../../../../mutate/drawDefinitions/entryGovernor/addDrawEntries';
import { automatedPositioning } from '../../../../mutate/drawDefinitions/automatedPositioning';
import { assignSeed } from '../../../../mutate/drawDefinitions/entryGovernor/seedAssignment';
import { attachPolicies } from '../../../../mutate/extensions/policies/attachPolicies';
import { getDrawStructures } from '../../../../acquire/findStructure';
import { generateRange } from '../../../../tools/arrays';

import SEEDING_POLICY from '@Fixtures/policies/POLICY_SEEDING_ITF';
import { MAIN, FIRST_MATCH_LOSER_CONSOLATION, CONSOLATION } from '../../../../constants/drawDefinitionConstants';

// NOTE: replace all other occurrences of this function with this one

export function generateFMLC(params) {
  const { tournamentRecord, policyDefinitions, participantsCount, seedsCount, drawSize } = params;
  const drawType = FIRST_MATCH_LOSER_CONSOLATION;

  const drawDefinition = newDrawDefinition();
  setStageDrawSize({ drawDefinition, stage: MAIN, drawSize });
  generateDrawTypeAndModifyDrawDefinition({
    policyDefinitions,
    drawDefinition,
    drawType,
  });

  const {
    structures: [mainStructure],
  } = getDrawStructures({ drawDefinition, stage: MAIN, stageSequence: 1 });
  const { structureId: mainStructureId } = mainStructure;

  const {
    structures: [consolationStructure],
  } = getDrawStructures({
    drawDefinition,
    stage: CONSOLATION,
    stageSequence: 1,
  });
  const { structureId: consolationStructureId } = consolationStructure;

  attachPolicies({
    policyDefinitions: policyDefinitions || SEEDING_POLICY,
    drawDefinition,
  });

  const participants = generateRange(0, participantsCount).map((i) => ({
    participantId: `fmlc-uuid${i + 1}`,
  }));
  const participantIds = participants.map((p) => p.participantId);

  addDrawEntries({ drawDefinition, stage: MAIN, participantIds });
  initializeStructureSeedAssignments({
    structureId: mainStructureId,
    drawDefinition,
    seedsCount,
  });

  generateRange(0, seedsCount).forEach((i) => {
    const seedNumber = i + 1;
    const participantId = participants[i].participantId;
    assignSeed({
      structureId: mainStructureId,
      drawDefinition,
      participantId,
      seedNumber,
    });
  });

  automatedPositioning({
    tournamentRecord,
    drawDefinition,
    structureId: mainStructureId,
  });

  return { mainStructureId, consolationStructureId, drawDefinition };
}

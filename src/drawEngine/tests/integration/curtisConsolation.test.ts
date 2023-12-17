import { generateDrawTypeAndModifyDrawDefinition } from '../../governors/structureGovernor/generateDrawTypeAndModifyDrawDefinition';
import { initializeStructureSeedAssignments } from '../../governors/positionGovernor/initializeSeedAssignments';
import { automatedPositioning } from '../../governors/positionGovernor/automatedPositioning';
import { getStructureSeedAssignments } from '../../../query/structure/getStructureSeedAssignments';
import { attachPolicies } from '../../../mutate/extensions/policies/attachPolicies';
import { setStageDrawSize } from '../../governors/entryGovernor/stageEntryCounts';
import { addDrawEntries } from '../../governors/entryGovernor/addDrawEntries';
import { assignSeed } from '../../governors/entryGovernor/seedAssignment';
import { verifyStructure } from '../primitives/verifyStructure';
import { getDrawStructures } from '../../getters/findStructure';
import { newDrawDefinition } from '../../stateMethods';
import { generateRange } from '../../../utilities';
import { expect, it } from 'vitest';

import SEEDING_POLICY from '../../../fixtures/policies/POLICY_SEEDING_ITF';
import {
  MAIN,
  CONSOLATION,
  CURTIS,
  PLAY_OFF,
} from '../../../constants/drawDefinitionConstants';

it('can generate and verify curtis structures', () => {
  let mainStructureId,
    consolation1stStructureId,
    consolation2ndStructureId,
    playoffStructureId,
    drawDefinition;

  ({
    consolation1stStructureId,
    consolation2ndStructureId,
    mainStructureId,
    drawDefinition,
  } = generateCurtis({
    participantsCount: 30,
    assignSeeds: 8,
    seedsCount: 8,
    drawSize: 32,
  }));

  const { seedAssignments } = getStructureSeedAssignments({
    structureId: mainStructureId,
    drawDefinition,
  });
  expect(seedAssignments?.length).toEqual(8);

  verifyStructure({
    expectedRoundMatchUpsCounts: [16, 8, 4, 2, 1],
    expectedPositionsAssignedCount: 32,
    expectedSeedValuesWithBye: [1, 2],
    structureId: mainStructureId,
    expectedByeAssignments: 2,
    expectedSeedsWithByes: 2,
    expectedSeeds: 8,
    drawDefinition,
  });

  verifyStructure({
    drawDefinition,
    structureId: consolation1stStructureId,
    expectedSeeds: 0,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 2,
    expectedSeedValuesWithBye: [],
    expectedPositionsAssignedCount: 2,
    expectedRoundMatchUpsCounts: [8, 8, 4, 2, 1],
  });

  verifyStructure({
    drawDefinition,
    structureId: consolation2ndStructureId,
    expectedSeeds: 0,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 0,
    expectedSeedValuesWithBye: [],
    expectedPositionsAssignedCount: 0,
    expectedRoundMatchUpsCounts: [2, 2, 1],
  });

  ({
    drawDefinition,
    mainStructureId,
    consolation1stStructureId,
    consolation2ndStructureId,
    playoffStructureId,
  } = generateCurtis({
    drawSize: 64,
    seedsCount: 16,
    assignSeeds: 14,
    participantsCount: 60,
  }));

  verifyStructure({
    drawDefinition,
    structureId: mainStructureId,
    expectedSeeds: 14,
    expectedSeedsWithByes: 4,
    expectedByeAssignments: 4,
    expectedSeedValuesWithBye: [1, 2, 3, 4],
    expectedPositionsAssignedCount: 64,
    expectedRoundMatchUpsCounts: [32, 16, 8, 4, 2, 1],
  });

  ({
    drawDefinition,
    mainStructureId,
    consolation1stStructureId,
    consolation2ndStructureId,
    playoffStructureId,
  } = generateCurtis({
    drawSize: 64,
    seedsCount: 16,
    assignSeeds: 14,
    participantsCount: 60,
  }));

  verifyStructure({
    drawDefinition,
    structureId: playoffStructureId,
    expectedSeeds: 0,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 0,
    expectedSeedValuesWithBye: [],
    expectedPositionsAssignedCount: 0,
    expectedRoundMatchUpsCounts: [1],
  });

  verifyStructure({
    drawDefinition,
    structureId: consolation1stStructureId,
    expectedSeeds: 0,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 4,
    expectedSeedValuesWithBye: [],
    expectedPositionsAssignedCount: 4,
    expectedRoundMatchUpsCounts: [16, 16, 8, 4, 2, 1],
  });

  verifyStructure({
    drawDefinition,
    structureId: consolation2ndStructureId,
    expectedSeeds: 0,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 0,
    expectedSeedValuesWithBye: [],
    expectedPositionsAssignedCount: 0,
    expectedRoundMatchUpsCounts: [4, 4, 2, 1],
  });
});

function generateCurtis({
  seedAssignmentProfile = {},
  participantsCount,
  assignSeeds,
  seedsCount,
  drawSize,
}) {
  const stage = MAIN;
  const drawType = CURTIS;

  const drawDefinition = newDrawDefinition();
  setStageDrawSize({ drawDefinition, stage, drawSize });
  generateDrawTypeAndModifyDrawDefinition({ drawDefinition, drawType });

  const { stageStructures } = getDrawStructures({
    withStageGrouping: true,
    drawDefinition,
  });
  expect(Object.keys(stageStructures).length).toEqual(drawSize === 64 ? 3 : 2);

  const {
    structures: [mainStructure],
  } = getDrawStructures({ drawDefinition, stage, stageSequence: 1 });
  const { structureId: mainStructureId } = mainStructure;

  const {
    structures: [playoffStructure],
  } = getDrawStructures({ drawDefinition, stage: PLAY_OFF, stageSequence: 2 });
  const playoffStructureId = playoffStructure?.structureId;

  const {
    structures: [consolation1stStructure],
  } = getDrawStructures({
    drawDefinition,
    stage: CONSOLATION,
    stageSequence: 1,
  });
  const { structureId: consolation1stStructureId } = consolation1stStructure;

  const {
    structures: [consolation2ndStructure],
  } = getDrawStructures({
    drawDefinition,
    stage: CONSOLATION,
    stageSequence: 2,
  });
  const { structureId: consolation2ndStructureId } = consolation2ndStructure;

  attachPolicies({ drawDefinition, policyDefinitions: SEEDING_POLICY });

  const participants = generateRange(0, participantsCount).map((i) => ({
    participantId: `ko-uuid${i + 1}`,
  }));
  const participantIds = participants.map((p) => p.participantId);

  addDrawEntries({ drawDefinition, stage, participantIds });
  initializeStructureSeedAssignments({
    structureId: mainStructureId,
    drawDefinition,
    seedsCount,
  });

  assignSeeds = assignSeeds || seedsCount;
  if (assignSeeds > participantsCount) assignSeeds = participantsCount;
  generateRange(1, assignSeeds + 1).forEach((seedNumber) => {
    const participantId = participants[seedNumber - 1].participantId;
    const seedValue = seedAssignmentProfile[seedNumber] || seedNumber;
    assignSeed({
      structureId: mainStructureId,
      drawDefinition,
      participantId,
      seedNumber,
      seedValue,
    });
  });

  automatedPositioning({ drawDefinition, structureId: mainStructureId });

  return {
    consolation1stStructureId,
    consolation2ndStructureId,
    playoffStructureId,
    mainStructureId,
    drawDefinition,
  };
}

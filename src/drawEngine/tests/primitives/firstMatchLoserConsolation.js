import { generateRange } from '../../../utilities';
import { drawEngine } from '../../sync';

import SEEDING_POLICY from '../../../fixtures/policies/POLICY_SEEDING_ITF';
import {
  MAIN,
  FIRST_MATCH_LOSER_CONSOLATION,
  CONSOLATION,
} from '../../../constants/drawDefinitionConstants';

export function generateFMLC({
  policyDefinitions,
  participantsCount,
  seedsCount,
  drawSize,
}) {
  const drawType = FIRST_MATCH_LOSER_CONSOLATION;

  drawEngine.reset();
  drawEngine.newDrawDefinition();
  drawEngine.setStageDrawSize({ stage: MAIN, drawSize });
  drawEngine.generateDrawTypeAndModifyDrawDefinition({
    policyDefinitions,
    drawType,
  });

  const {
    structures: [mainStructure],
  } = drawEngine.getDrawStructures({ stage: MAIN, stageSequence: 1 });
  const { structureId: mainStructureId } = mainStructure;

  const {
    structures: [consolationStructure],
  } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1 });
  const { structureId: consolationStructureId } = consolationStructure;

  drawEngine.attachPolicies({
    policyDefinitions: policyDefinitions || SEEDING_POLICY,
  });

  const participants = generateRange(0, participantsCount).map((i) => ({
    participantId: `fmlc-uuid${i + 1}`,
  }));
  const participantIds = participants.map((p) => p.participantId);

  drawEngine.addDrawEntries({ stage: MAIN, participantIds });
  drawEngine.initializeStructureSeedAssignments({
    structureId: mainStructureId,
    seedsCount,
  });

  generateRange(0, seedsCount).forEach((i) => {
    const seedNumber = i + 1;
    const participantId = participants[i].participantId;
    drawEngine.assignSeed({
      structureId: mainStructureId,
      participantId,
      seedNumber,
    });
  });

  drawEngine.automatedPositioning({ structureId: mainStructureId });

  return { mainStructureId, consolationStructureId };
}

import { drawEngine } from '../../sync';
import { generateRange } from '../../../utilities';

import {
  MAIN,
  FEED_FMLC,
  CONSOLATION,
} from '../../../constants/drawDefinitionConstants';
import SEEDING_POLICY from '../../../fixtures/policies/POLICY_SEEDING_ITF';

export function generateFMLC({
  drawSize,
  seedsCount,
  participantsCount,
  policyDefinition,
}) {
  const drawType = FEED_FMLC;

  drawEngine.reset();
  drawEngine.newDrawDefinition();
  drawEngine.setStageDrawSize({ stage: MAIN, drawSize });
  drawEngine.generateDrawType({ drawType });

  const {
    structures: [mainStructure],
  } = drawEngine.getDrawStructures({ stage: MAIN, stageSequence: 1 });
  const { structureId: mainStructureId } = mainStructure;

  const {
    structures: [consolationStructure],
  } = drawEngine.getDrawStructures({ stage: CONSOLATION, stageSequence: 1 });
  const { structureId: consolationStructureId } = consolationStructure;

  drawEngine.attachPolicy({
    policyDefinition: policyDefinition || SEEDING_POLICY,
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
      seedNumber,
      participantId,
    });
  });

  drawEngine.automatedPositioning({ structureId: mainStructureId });

  return { mainStructureId, consolationStructureId };
}

import { drawEngine } from '../../../drawEngine';
import { generateRange } from '../../../utilities';

import {
  MAIN,
  ALTERNATE,
  ELIMINATION,
  QUALIFYING,
} from '../../../constants/drawDefinitionConstants';
import SEEDING_POLICY from '../../../fixtures/SEEDING_ITF';
import AVOIDANCE_POLICY from '../../../fixtures/AVOIDANCE_COUNTRY';

export function generateEliminationWithQualifying({
  qualifyingRound,
  qualifyingDrawSize,
  qualifyingPositions,
  qualifyingSeedsCount = 0,
  qualifyingParticipantsCount = 0,
  qualifyingSeedAssignmentProfile = {},

  assignMainSeeds,
  assignQualifyingSeeds,

  alternatesCount,

  drawSize,
  mainSeedsCount,
  mainParticipantsCount = 0,
  mainSeedAssignmentProfile = {},
}) {
  drawEngine.reset();
  drawEngine.newDrawDefinition();
  drawEngine.attachPolicy({ policyDefinition: SEEDING_POLICY });
  drawEngine.attachPolicy({ policyDefinition: AVOIDANCE_POLICY });

  drawEngine.setStageDrawSize({
    stage: QUALIFYING,
    drawSize: qualifyingDrawSize,
  });
  drawEngine.generateDrawType({
    stage: QUALIFYING,
    drawType: ELIMINATION,
    qualifyingRound,
    qualifyingPositions,
  });

  const { structures: qualifyingStructures } = drawEngine.getDrawStructures({
    stage: QUALIFYING,
    stageSequence: 1,
  });
  const [qualifyingStructure] = qualifyingStructures;
  const { roundLimit } = qualifyingStructure;
  const { structureId: qualifyingStructureId } = qualifyingStructure;
  const { qualifiersCount } = drawEngine.getStructureQualifiersCount({
    structure: qualifyingStructure,
  });

  drawEngine.setStageDrawSize({ stage: MAIN, drawSize });
  drawEngine.setStageQualifiersCount({ stage: MAIN, qualifiersCount });
  drawEngine.generateDrawType({ stage: MAIN, drawType: ELIMINATION });

  const totalParticipantsCount =
    qualifyingParticipantsCount + mainParticipantsCount - qualifiersCount;
  const participants = generateRange(0, totalParticipantsCount).map(i => ({
    participantId: `ko-uuid${i + 1}`,
  }));
  const qualifyingParticipants = participants.slice(
    0,
    qualifyingParticipantsCount
  );
  const qualifyingParticipantIds = qualifyingParticipants.map(
    p => p.participantId
  );
  const mainDrawParticipants = participants.slice(qualifyingParticipantsCount);
  const mainDrawParticipantIds = mainDrawParticipants.map(p => p.participantId);

  drawEngine.addDrawEntries({
    stage: QUALIFYING,
    participantIds: qualifyingParticipantIds,
  });
  drawEngine.addDrawEntries({
    stage: MAIN,
    participantIds: mainDrawParticipantIds,
  });

  const alternateParticipants = generateRange(0, alternatesCount).map(i => ({
    participantId: `alt-uuid${i + 1}`,
  }));
  const alternateParticipantIds = alternateParticipants.map(
    p => p.participantId
  );
  drawEngine.addDrawEntries({
    stage: QUALIFYING,
    participantIds: alternateParticipantIds,
    entryStatus: ALTERNATE,
  });

  const { structures: mainStructures } = drawEngine.getDrawStructures({
    stage: MAIN,
    stageSequence: 1,
  });
  const [mainStructure] = mainStructures;
  const { structureId: mainStructureId } = mainStructure;

  drawEngine.createQualifyingLink({
    qualifyingStructureId,
    mainStructureId,
    qualifyingRound: roundLimit,
  });
  drawEngine.initializeStructureSeedAssignments({
    structureId: qualifyingStructureId,
    seedsCount: qualifyingSeedsCount,
  });
  drawEngine.initializeStructureSeedAssignments({
    structureId: mainStructureId,
    seedsCount: mainSeedsCount,
  });

  assignQualifyingSeeds = assignQualifyingSeeds || qualifyingSeedsCount;
  generateRange(1, assignQualifyingSeeds + 1).forEach(seedNumber => {
    const participantId = qualifyingParticipants[seedNumber - 1].participantId;
    const seedValue = qualifyingSeedAssignmentProfile[seedNumber] || seedNumber;
    drawEngine.assignSeed({
      structureId: qualifyingStructureId,
      seedNumber,
      seedValue,
      participantId,
    });
  });

  assignMainSeeds = assignMainSeeds || mainSeedsCount;
  generateRange(1, assignMainSeeds + 1).forEach(seedNumber => {
    const participantId = mainDrawParticipants[seedNumber - 1].participantId;
    const seedValue = mainSeedAssignmentProfile[seedNumber] || seedNumber;
    drawEngine.assignSeed({
      structureId: mainStructureId,
      seedNumber,
      seedValue,
      participantId,
    });
  });

  drawEngine.automatedPositioning({ structureId: qualifyingStructureId });
  drawEngine.automatedPositioning({ structureId: mainStructureId });

  return { qualifyingStructureId, mainStructureId };
}

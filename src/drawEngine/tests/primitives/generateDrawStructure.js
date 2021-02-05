import { drawEngine } from '../../sync';
import { generateRange } from '../../../utilities';

import {
  MAIN,
  ALTERNATE,
  SINGLE_ELIMINATION,
  FEED_IN,
} from '../../../constants/drawDefinitionConstants';
import SEEDING_POLICY from '../../../fixtures/seeding/SEEDING_ITF';

export function generateDrawStructure({
  automated,
  drawSize,
  stage = MAIN,
  seedsCount,
  assignSeeds,
  alternatesCount,

  tieFormat,
  matchUpFormat,

  participants,
  participantsCount,

  qualifyingRound,
  qualifyingPositions,
  seedAssignmentProfile = {},
  drawType = SINGLE_ELIMINATION,
}) {
  drawEngine.reset();
  drawEngine.newDrawDefinition();
  drawEngine.setStageDrawSize({ stage, drawSize });
  drawEngine.setMatchUpFormat({ matchUpFormat, tieFormat });
  drawEngine.generateDrawType({
    stage,
    drawType,
    qualifyingRound,
    qualifyingPositions,
  });

  const { structures } = drawEngine.getDrawStructures({
    stage,
    stageSequence: 1,
  });
  const [structure] = structures;
  const { structureId } = structure || {};

  drawEngine.attachPolicy({ policyDefinition: SEEDING_POLICY });

  if (participants && participantsCount !== undefined) {
    participants = participants.slice(0, participantsCount);
  } else {
    participants =
      participants ||
      generateRange(0, participantsCount).map((i) => ({
        participantId: `ko-uuid${i + 1}`,
      }));
  }
  const participantIds = participants.map((p) => p.participantId);

  drawEngine.addDrawEntries({ stage, participantIds });

  const alternateParticipants = generateRange(0, alternatesCount).map((i) => ({
    participantId: `alt-uuid${i + 1}`,
  }));
  const alternateParticipantIds = alternateParticipants.map(
    (p) => p.participantId
  );
  drawEngine.addDrawEntries({
    stage: MAIN,
    participantIds: alternateParticipantIds,
    entryStatus: ALTERNATE,
  });

  drawEngine.initializeStructureSeedAssignments({ structureId, seedsCount });

  assignSeeds = assignSeeds || seedsCount;
  generateRange(1, assignSeeds + 1).forEach((seedNumber) => {
    const participantId = participants[seedNumber - 1].participantId;
    const seedValue = seedAssignmentProfile[seedNumber] || seedNumber;
    drawEngine.assignSeed({
      structureId,
      seedNumber,
      seedValue,
      participantId,
    });
  });

  if (automated !== false)
    drawEngine.automatedPositioning({ participants, structureId });

  const { drawDefinition } = drawEngine.getState();

  return { structureId, drawDefinition };
}

export function generateFeedIn({
  drawSize,
  automated,
  seedsCount,
  assignSeeds,
  participantsCount,
  seedAssignmentProfile = {},
}) {
  const stage = MAIN;
  const drawType = FEED_IN;

  drawEngine.reset();
  drawEngine.newDrawDefinition();
  drawEngine.setStageDrawSize({ stage, drawSize });
  drawEngine.generateDrawType({ drawType });
  const {
    structures: [structure],
  } = drawEngine.getDrawStructures({ stage, stageSequence: 1 });
  const { structureId } = structure;

  drawEngine.attachPolicy({ policyDefinition: SEEDING_POLICY });

  const participants = generateRange(0, participantsCount).map((i) => ({
    participantId: `ko-uuid${i + 1}`,
  }));
  const participantIds = participants.map((p) => p.participantId);

  drawEngine.addDrawEntries({ stage, participantIds });
  drawEngine.initializeStructureSeedAssignments({ structureId, seedsCount });

  assignSeeds = assignSeeds || seedsCount;
  if (assignSeeds > participantsCount) assignSeeds = participantsCount;

  generateRange(1, assignSeeds + 1).forEach((seedNumber) => {
    const participantId = participants[seedNumber - 1].participantId;
    const seedValue = seedAssignmentProfile[seedNumber] || seedNumber;
    drawEngine.assignSeed({
      structureId,
      seedNumber,
      seedValue,
      participantId,
    });
  });

  if (automated !== false) drawEngine.automatedPositioning({ structureId });

  const { drawDefinition } = drawEngine.getState();

  return { structureId, drawDefinition };
}

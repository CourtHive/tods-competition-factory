import { tieFormatDefaults } from './tieFormatDefaults';
import { getParticipantScaleItem } from '../governors/queryGovernor/scaleValue';

import {
  MAIN,
  ROUND_ROBIN_WITH_PLAYOFF,
  QUALIFYING,
  ROUND_ROBIN,
} from '../../constants/drawDefinitionConstants';

import SEEDING_POLICY from '../../fixtures/SEEDING_USTA';
import AVOIDANCE_POLICY from '../../fixtures/AVOIDANCE_COUNTRY';
import { ALTERNATE, RANKING } from '../../constants/participantConstants';

export function generateDrawDefinition(props) {
  const { tournamentRecord, drawEngine, event } = props;

  const {
    groupSize,
    customName,
    automated = true,
    qualifyingRound,
    qualifyingPositions,
    drawType = 'ELIMINATION',
    matchUpType,
  } = props;

  let { seedsCount, drawSize = 32, tieFormat, matchUpFormat } = props;

  // coersion
  if (typeof drawSize !== 'number') drawSize = parseInt(drawSize);
  if (typeof seedsCount !== 'number') seedsCount = parseInt(seedsCount);

  if (tieFormat || (matchUpType === 'TEAM' && !tieFormat)) {
    tieFormat = tieFormatDefaults();
    matchUpFormat = undefined;
  } else if (!matchUpFormat) {
    tieFormat = undefined;
    matchUpFormat = 'SET3-S:6/TB7';
  }

  const drawProfile = {
    category: event.category,
    groupSize,
    customName,
    seedsCount,
    drawSize,
    qualifyingRound,
    qualifyingPositions,
    automated,
    drawType,
    tieFormat,
    matchUpFormat,
    matchUpType,
  };

  const entries = event.entries || [];
  const drawIsRRWP = drawType === ROUND_ROBIN_WITH_PLAYOFF;
  const stage = drawIsRRWP ? QUALIFYING : MAIN;
  const stageEntries = entries.filter(
    entry => entry.entryStage === stage && entry.entryStatus !== ALTERNATE
  );
  if ([ROUND_ROBIN, ROUND_ROBIN_WITH_PLAYOFF].includes(drawType)) {
    drawSize = stageEntries.length;
  }

  const structureOptions = drawIsRRWP
    ? {
        playOffGroups: [
          { finishingPositions: [1, 2], structureName: 'Playoffs' },
        ],
      }
    : drawType === ROUND_ROBIN
    ? { groupSize, groupSizeLimit: 8 }
    : undefined;

  drawEngine.reset();
  drawEngine.newDrawDefinition({ drawProfile });
  drawEngine.setStageDrawSize({ stage, drawSize });
  drawEngine.setMatchUpFormat({ matchUpFormat, tieFormat, matchUpType });
  drawEngine.generateDrawType({
    stage,
    drawType,
    structureOptions,
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
  drawEngine.attachPolicy({ policyDefinition: AVOIDANCE_POLICY });

  entries.forEach(entry => {
    // TODO: attach participant scaleValues to entry information (if relevant?)
    const entryData = Object.assign({}, entry, { stage: entry.entryStage });
    drawEngine.addDrawEntry(entryData);
  });

  if (seedsCount > drawSize) seedsCount = drawSize;
  if (seedsCount > stageEntries.length) seedsCount = stageEntries.length;
  drawEngine.initializeStructureSeedAssignments({ structureId, seedsCount });

  if (event.category) {
    /**
     * CONVENIENCE SEED BY RANKING WHEN POSSIBLE
     */
    const scaleAttributes = {
      scaleType: RANKING,
      scaleName: event.category.categoryName,
      eventType: event.eventType,
    };

    const scaledEntries = entries
      .map(entry => {
        const { participantId } = entry;
        const { scaleItem } = getParticipantScaleItem({
          tournamentRecord,
          participantId,
          scaleAttributes,
        });
        return Object.assign({}, entry, scaleItem);
      })
      .filter(scaledEntry => scaledEntry.scaleValue)
      .sort(scaleValueSort);

    if (scaledEntries.length < seedsCount) seedsCount = scaledEntries.length;

    // drawEngine.initializeStructureSeedAssignments({ structureId, seedsCount });

    scaledEntries.slice(0, seedsCount).forEach((scaledEntry, index) => {
      const seedNumber = index + 1;
      const seedValue = seedNumber;
      // const scaleValue = scaledEntry.scaleValue;
      // TODO: attach basis of seeding information to seedAssignment
      const { participantId } = scaledEntry;
      const result = drawEngine.assignSeed({
        structureId,
        seedNumber,
        seedValue,
        participantId,
      });
      if (!result.success) console.log(`%c ${result.error}`, 'color: red');
    });
  }

  if (automated !== false) drawEngine.automatedPositioning({ structureId });

  const { drawDefinition } = drawEngine.getState();

  const drawName = customName || drawType;
  if (drawDefinition) Object.assign(drawDefinition, { drawName });

  return { structureId, drawDefinition };
}

function scaleValueSort(a, b) {
  return parseFloat(a.scaleValue || 9999) - parseFloat(b.scaleValue || 9999);
}

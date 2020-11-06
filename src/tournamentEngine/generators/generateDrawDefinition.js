import { tieFormatDefaults } from './tieFormatDefaults';

import {
  MAIN,
  ROUND_ROBIN,
  ELIMINATION,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../constants/drawDefinitionConstants';

import SEEDING_POLICY from '../../fixtures/seeding/SEEDING_USTA';
import { ALTERNATE } from '../../constants/participantConstants';
import { RANKING, SEEDING } from '../../constants/scaleConstants';
import { getAppliedPolicies } from '../../drawEngine/governors/policyGovernor/getAppliedPolicies';
import { TEAM } from '../../constants/matchUpTypes';
import { getScaledEntries } from '../governors/eventGovernor/getScaledEntries';

export function generateDrawDefinition(props) {
  const { tournamentRecord, drawEngine, event } = props;
  let { structureOptions } = props;

  const {
    customName,
    seedingProfile,
    qualifyingRound,
    automated = true,
    policyDefinitions,
    qualifyingPositions,
    drawType = ELIMINATION,
    playoffMatchUpFormat,
    matchUpType,
    seededParticipants,
  } = props;

  let { seedsCount, drawSize = 32, tieFormat, matchUpFormat } = props;

  // coersion
  if (typeof drawSize !== 'number') drawSize = parseInt(drawSize);
  if (typeof seedsCount !== 'number') seedsCount = parseInt(seedsCount || 0);

  if (tieFormat || (matchUpType === TEAM && !tieFormat)) {
    tieFormat = tieFormatDefaults();
    matchUpFormat = undefined;
  } else if (!matchUpFormat) {
    tieFormat = undefined;
    matchUpFormat = 'SET3-S:6/TB7';
  }

  const drawProfile = {
    drawType,
    drawSize,
    automated,
    customName,
    seedsCount,

    tieFormat,
    matchUpType,
    matchUpFormat,

    structureOptions,
    qualifyingRound,
    qualifyingPositions,

    category: event?.category,
  };

  const stage = MAIN;
  const entries = event?.entries || [];
  const drawIsRRWP = drawType === ROUND_ROBIN_WITH_PLAYOFF;
  const stageEntries = entries.filter(
    entry => entry.entryStage === stage && entry.entryStatus !== ALTERNATE
  );
  if ([ROUND_ROBIN].includes(drawType)) {
    drawSize = stageEntries.length;
  }

  if (drawIsRRWP && !structureOptions) {
    structureOptions = drawIsRRWP
      ? {
          playoffGroups: [
            { finishingPositions: [1, 2], structureName: 'Playoffs' },
          ],
        }
      : undefined;
  }

  drawEngine.reset();
  drawEngine.newDrawDefinition({ drawProfile });
  drawEngine.setStageDrawSize({ stage, drawSize });
  drawEngine.setMatchUpFormat({ matchUpFormat, tieFormat, matchUpType });
  drawEngine.generateDrawType({
    stage,
    drawType,
    seedingProfile,
    structureOptions,
    qualifyingRound,
    qualifyingPositions,

    matchUpFormat,
    playoffMatchUpFormat,
  });

  const { structures } = drawEngine.getDrawStructures({
    stage,
    stageSequence: 1,
  });
  const [structure] = structures;
  const { structureId } = structure || {};

  if (Array.isArray(policyDefinitions)) {
    policyDefinitions.forEach(policyDefinition => {
      drawEngine.attachPolicy({ policyDefinition });
    });
  }

  const { appliedPolicies } = getAppliedPolicies(drawEngine.getState());
  if (!appliedPolicies?.seeding) {
    drawEngine.attachPolicy({ policyDefinition: SEEDING_POLICY });
  }

  entries.forEach(entry => {
    // TODO: attach participant scaleValues to entry information (if relevant?)
    const entryData = Object.assign({}, entry, { stage: entry.entryStage });
    drawEngine.addDrawEntry(entryData);
  });

  if (seedsCount > drawSize) seedsCount = drawSize;
  if (seedsCount > stageEntries.length) seedsCount = stageEntries.length;
  drawEngine.initializeStructureSeedAssignments({ structureId, seedsCount });

  if (seededParticipants) {
    seededParticipants
      .filter(
        seededParticipant =>
          !seededParticipant.seedNumber ||
          seededParticipant.seedNumber > seededParticipants.length
      )
      .sort((a, b) => {
        if (a.seedValue < b.seedValue) return -1;
        if (a.seedValue < b.seedValue) return 1;
        return 0;
      })
      .forEach(seededParticipant => {
        const { participantId, seedNumber, seedValue } = seededParticipant;
        const result = drawEngine.assignSeed({
          structureId,
          seedNumber,
          seedValue,
          participantId,
        });
        if (!result.success) console.log(`%c ${result.error}`, 'color: red');
      });
  } else if (event?.category) {
    // if no seededParticipants have been defined, seed by seeding scale or ranking scale, if present

    const seedingScaleAttributes = {
      scaleType: SEEDING,
      scaleName: event.category.categoryName,
      eventType: event.eventType,
    };

    const rankingScaleAttributes = {
      scaleType: RANKING,
      scaleName: event.category.categoryName,
      eventType: event.eventType,
    };

    const { scaledEntries: seedingScaledEntries } = getScaledEntries({
      scaleAttributes: seedingScaleAttributes,
      tournamentRecord,
      event,
      stage,
    });

    const { scaledEntries: rankingScaledEntries } = getScaledEntries({
      scaleAttributes: rankingScaleAttributes,
      tournamentRecord,
      event,
      stage,
    });

    // Attempt to seed based on seeding scaled entries and then rank scaled entries
    const scaledEntries = seedingScaledEntries?.length
      ? seedingScaledEntries
      : rankingScaledEntries;

    if (scaledEntries.length < seedsCount) seedsCount = scaledEntries.length;

    scaledEntries.slice(0, seedsCount).forEach((scaledEntry, index) => {
      const seedNumber = index + 1;
      const seedValue = seedNumber;
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

  let conflicts = [];
  if (automated !== false) {
    const participants = tournamentRecord?.participants;
    ({ conflicts } = drawEngine.automatedPositioning({
      structureId,
      participants,
    }));
  }

  const { drawDefinition } = drawEngine.getState();

  const drawName = customName || drawType;
  if (drawDefinition) Object.assign(drawDefinition, { drawName });

  return { structureId, drawDefinition, conflicts };
}

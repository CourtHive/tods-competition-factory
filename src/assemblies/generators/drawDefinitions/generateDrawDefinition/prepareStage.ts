import { initializeStructureSeedAssignments } from '../../../../mutate/drawDefinitions/positionGovernor/initializeSeedAssignments';
import { automatedPositioning } from '../../../../mutate/drawDefinitions/automatedPositioning';
import { assignSeed } from '../../../../mutate/drawDefinitions/entryGovernor/seedAssignment';
import { ResultType, decorateResult } from '../../../../global/functions/decorateResult';
import { getValidSeedBlocks } from '../../../../query/drawDefinition/seedGetter';
import { getScaledEntries } from '../../../../query/event/getScaledEntries';
import { getParticipantId } from '../../../../global/functions/extractors';
import { getDrawStructures } from '../../../../acquire/findStructure';
import { findExtension } from '../../../../acquire/findExtension';

import { STRUCTURE_NOT_FOUND } from '../../../../constants/errorConditionConstants';
import { DIRECT_ENTRY_STATUSES } from '../../../../constants/entryStatusConstants';
import { AD_HOC, QUALIFYING } from '../../../../constants/drawDefinitionConstants';
import { Entry, PositionAssignment } from '../../../../types/tournamentTypes';
import { RANKING, SEEDING } from '../../../../constants/scaleConstants';
import { ROUND_TARGET } from '../../../../constants/extensionConstants';

export function prepareStage(params): ResultType & {
  positionAssignments?: PositionAssignment[];
  positioningReport?: any;
  stageEntries?: Entry[];
  structureId?: string;
  seedsCount?: number;
  conflicts?: any[];
} {
  const stack = 'prepareStage';

  const { drawDefinition } = params;
  const { structures } = getDrawStructures({
    stageSequence: params.stageSequence || 1,
    roundTarget: params.roundTarget,
    stage: params.stage,
    drawDefinition,
  });

  const preparedStructureIds: string[] = params.preparedStructureIds || [];
  const structure = structures?.find(({ structureId }) => !preparedStructureIds.includes(structureId));
  if (!structure) return decorateResult({ result: { error: STRUCTURE_NOT_FOUND }, stack });
  const structureId = structure?.structureId;

  const { seedsCount, stageEntries, seedLimit } = getSeedsCountAndStageEntries({ ...params, structureId });
  if (params.seededParticipants || params.event || params.seedingScaleName) {
    seeding({ ...params, seedsCount, structure, structureId });
  }

  const doPositioning =
    params.automated !== false && params.drawType !== AD_HOC && !(params.qualifyingOnly && params.stage !== QUALIFYING);
  const multipleStructures = (structures?.length || 0) > 1;
  const positioningResult = doPositioning ? positioning({ ...params, multipleStructures, seedLimit, structureId }) : {};
  if (positioningResult?.error) return decorateResult({ result: positioningResult, stack });

  return {
    ...positioningResult,
    stageEntries,
    structureId,
    seedsCount,
  };
}

function getStageEntries({ entries, stage, stageSequence, roundTarget }) {
  return entries.filter((entry) => {
    const entryRoundTarget = findExtension({
      name: ROUND_TARGET,
      element: entry,
    })?.extension?.value;

    return (
      (!entry.entryStage || entry.entryStage === stage) &&
      (!stageSequence || !entry.entryStageSequence || entry.entryStageSequence === stageSequence) &&
      (!roundTarget || !entryRoundTarget || entryRoundTarget === roundTarget) &&
      DIRECT_ENTRY_STATUSES.includes(entry.entryStatus)
    );
  });
}

function positioning(
  params,
): ResultType & { conflicts?: any[]; positionAssignments?: PositionAssignment[]; positioningReport?: any } {
  const seedsOnly = typeof params.automated === 'object' && params.automated.seedsOnly;
  // if { seedsOnly: true } then only seeds and an Byes releated to seeded positions are placed
  const result = automatedPositioning({ ...params, seedsOnly });
  if (result.error) return result;

  const positionAssignments = result?.positionAssignments;
  const positioningReport = result?.positioningReport;

  return { conflicts: result.conflicts, positionAssignments, positioningReport };
}

function seeding(params) {
  const { seededParticipants, seedingScaleName, entries, event } = params;
  const enteredParticipantIds = entries.map(getParticipantId);

  if (seededParticipants) {
    processSeededParticipants({ ...params, enteredParticipantIds });
  } else if (event || seedingScaleName) {
    // if no seededParticipants have been defined, seed by seeding scale or ranking scale, if present
    scaledEntriesSeeding({ ...params, enteredParticipantIds });
  }
}

function processSeededParticipants(params) {
  const {
    provisionalPositioning,
    enteredParticipantIds,
    seededParticipants,
    tournamentRecord,
    appliedPolicies,
    drawDefinition,
    seedingProfile,
    structureId,
    structure,
    event,
  } = params;

  const seedBlockInfo = structure
    ? getValidSeedBlocks({
        provisionalPositioning,
        appliedPolicies,
        drawDefinition,
        seedingProfile,
        structure,
      })
    : undefined;

  seededParticipants
    .filter(({ participantId }) => enteredParticipantIds.includes(participantId))
    .filter(
      (seededParticipant) => !seededParticipant.seedNumber || seededParticipant.seedNumber <= seededParticipants.length,
    )
    .sort((a, b) => {
      if (a.seedNumber < b.seedNumber) return -1;
      if (a.seedNumber < b.seedNumber) return 1;
      return 0;
    })
    .forEach((seededParticipant) => {
      const { participantId, seedNumber, seedValue } = seededParticipant;
      assignSeed({
        provisionalPositioning,
        tournamentRecord,
        drawDefinition,
        seedingProfile,
        participantId,
        seedBlockInfo,
        structureId,
        seedNumber,
        seedValue,
        event,
      });
    });
}

function scaledEntriesSeeding(params) {
  let seedsCount = params.seedsCount;
  const {
    provisionalPositioning,
    enteredParticipantIds,
    seedAssignmentProfile, // mainly used by mocksEngine for scenario testing
    assignSeedsCount, // used for testing bye placement next to seeds
    tournamentRecord,
    drawDefinition,
    seedByRanking,
    seedingProfile,
    structureId,
    event,
  } = params;

  const { categoryName, ageCategoryCode } = event?.category || {};
  const eventType = event?.eventType;

  const scaledEntries =
    getSeedingScaleEntries({ ...params, ageCategoryCode, categoryName, eventType }) ||
    (seedByRanking && getRankingScaleEntries({ ...params, ageCategoryCode, categoryName, eventType }));

  const scaledEntriesCount = scaledEntries?.length ?? 0;
  if (scaledEntriesCount < seedsCount) seedsCount = scaledEntriesCount;

  scaledEntries
    ?.filter(({ participantId }) => enteredParticipantIds.includes(participantId))
    .slice(0, assignSeedsCount || seedsCount)
    .forEach((scaledEntry, index) => {
      const seedNumber = index + 1;
      const { participantId, scaleValue } = scaledEntry;
      const seedValue = seedAssignmentProfile?.[seedNumber] || scaleValue || seedNumber;
      assignSeed({
        provisionalPositioning,
        tournamentRecord,
        drawDefinition,
        seedingProfile,
        participantId,
        structureId,
        seedNumber,
        seedValue,
        event,
      });
    });
}

function getSeedingScaleEntries(params) {
  const { tournamentRecord, seedingScaleName, stageSequence, entries, stage, event } = params;

  const { categoryName, ageCategoryCode } = event?.category || {};
  const eventType = event?.eventType;

  const seedingScaleAttributes = {
    scaleName: seedingScaleName || categoryName || ageCategoryCode || event.eventId,
    scaleType: SEEDING,
    eventType,
  };

  return getScaledEntries({
    scaleAttributes: seedingScaleAttributes,
    tournamentRecord,
    stageSequence,
    entries,
    stage,
  }).scaledEntries;
}

function getRankingScaleEntries(params) {
  const { tournamentRecord, stageSequence, event, entries, stage } = params;
  const { categoryName, ageCategoryCode } = event?.category || {};
  const eventType = event?.eventType;

  const rankingScaleAttributes = {
    scaleName: categoryName || ageCategoryCode,
    scaleType: RANKING,
    eventType,
  };

  return getScaledEntries({
    scaleAttributes: rankingScaleAttributes,
    tournamentRecord,
    stageSequence,
    entries,
    stage,
  }).scaledEntries;
}

function getSeedsCountAndStageEntries(params) {
  let { seedsCount } = params;
  if (params.seededParticipants) seedsCount = params.seededParticipants.length;
  if (seedsCount > params.drawSize) seedsCount = params.drawSize;

  const stageEntries = getStageEntries(params);
  if (seedsCount > stageEntries.length) seedsCount = stageEntries.length;

  const { seedLimit } = initializeStructureSeedAssignments({
    enforcePolicyLimits: params.enforcePolicyLimits ?? true,
    appliedPolicies: params.appliedPolicies,
    participantsCount: stageEntries.length,
    seedingProfile: params.seedingProfile,
    drawDefinition: params.drawDefinition,
    structureId: params.structureId,
    seedsCount,
  });

  if (seedLimit && seedLimit < seedsCount) seedsCount = seedLimit;

  return { seedsCount, stageEntries, seedLimit };
}

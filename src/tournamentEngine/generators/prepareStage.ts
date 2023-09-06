import { initializeStructureSeedAssignments } from '../../drawEngine/governors/positionGovernor/initializeSeedAssignments';
import { automatedPositioning } from '../../drawEngine/governors/positionGovernor/automatedPositioning';
import { getScaledEntries } from '../governors/eventGovernor/entries/getScaledEntries';
import { assignSeed } from '../../drawEngine/governors/entryGovernor/seedAssignment';
import { findExtension } from '../governors/queryGovernor/extensionQueries';
import { getDrawStructures } from '../../drawEngine/getters/findStructure';
import { getValidSeedBlocks } from '../../drawEngine/getters/seedGetter';
import { getParticipantId } from '../../global/functions/extractors';
import {
  ResultType,
  decorateResult,
} from '../../global/functions/decorateResult';

import { STRUCTURE_NOT_FOUND } from '../../constants/errorConditionConstants';
import { Entry, PositionAssignment } from '../../types/tournamentFromSchema';
import { DIRECT_ENTRY_STATUSES } from '../../constants/entryStatusConstants';
import { AD_HOC, QUALIFYING } from '../../constants/drawDefinitionConstants';
import { RANKING, SEEDING } from '../../constants/scaleConstants';
import { ROUND_TARGET } from '../../constants/extensionConstants';

export function prepareStage(params): ResultType & {
  positionAssignments?: PositionAssignment[];
  positioningReport?: any;
  stageEntries?: Entry[];
  structureId?: string;
  seedsCount?: number;
  conflicts?: any[];
} {
  let { seedsCount } = params;
  const preparedStructureIds: string[] = params.preparedStructureIds || [];
  const {
    provisionalPositioning,
    inContextDrawMatchUps,
    tournamentRecord,
    appliedPolicies,
    qualifyingOnly,
    drawDefinition,
    seedingProfile,
    participants,
    matchUpsMap,
    automated,
    placeByes,
    drawType,
    drawSize,
    entries,
    event,

    enforcePolicyLimits = true,
    seedAssignmentProfile, // mainly used by mocksEngine for scenario testing
    seedByRanking = true,
    seededParticipants,
    assignSeedsCount, // used for testing bye placement next to seeds
    seedingScaleName,

    stageSequence = 1,
    roundTarget,
    stage,
  } = params;
  const eventType = event?.eventType;
  const stageEntries = entries.filter((entry) => {
    const entryRoundTarget = findExtension({
      name: ROUND_TARGET,
      element: entry,
    })?.extension?.value;

    return (
      (!entry.entryStage || entry.entryStage === stage) &&
      (!stageSequence ||
        !entry.entryStageSequence ||
        entry.entryStageSequence === stageSequence) &&
      (!roundTarget || !entryRoundTarget || entryRoundTarget === roundTarget) &&
      DIRECT_ENTRY_STATUSES.includes(entry.entryStatus)
    );
  });

  if (seededParticipants) seedsCount = seededParticipants.length;
  if (seedsCount > drawSize) seedsCount = drawSize;
  if (seedsCount > stageEntries.length) seedsCount = stageEntries.length;

  const { structures } = getDrawStructures({
    drawDefinition,
    stageSequence,
    roundTarget,
    stage,
  });
  const multipleStructures = (structures?.length || 0) > 1;

  const structure = structures?.find(
    ({ structureId }) => !preparedStructureIds.includes(structureId)
  );
  if (!structure)
    return decorateResult({ result: { error: STRUCTURE_NOT_FOUND } });
  const structureId = structure?.structureId;

  const seedBlockInfo = structure
    ? getValidSeedBlocks({
        provisionalPositioning,
        appliedPolicies,
        drawDefinition,
        structure,
      })
    : undefined;

  const { seedLimit } = initializeStructureSeedAssignments({
    participantsCount: stageEntries.length,
    enforcePolicyLimits,
    appliedPolicies,
    drawDefinition,
    seedingProfile,
    structureId,
    seedsCount,
  });

  if (seedLimit && seedLimit < seedsCount) seedsCount = seedLimit;

  const enteredParticipantIds = entries.map(getParticipantId);

  if (seededParticipants) {
    seededParticipants
      .filter(({ participantId }) =>
        enteredParticipantIds.includes(participantId)
      )
      .filter(
        (seededParticipant) =>
          !seededParticipant.seedNumber ||
          seededParticipant.seedNumber <= seededParticipants.length
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
  } else if (event || seedingScaleName) {
    // if no seededParticipants have been defined, seed by seeding scale or ranking scale, if present

    const { categoryName, ageCategoryCode } = event?.category || {};

    const seedingScaleAttributes = {
      scaleType: SEEDING,
      scaleName:
        seedingScaleName || categoryName || ageCategoryCode || event.eventId,
      eventType,
    };

    let { scaledEntries } = getScaledEntries({
      scaleAttributes: seedingScaleAttributes,
      tournamentRecord,
      stageSequence,
      entries,
      stage,
    });

    if (!scaledEntries?.length && seedByRanking) {
      const rankingScaleAttributes = {
        scaleType: RANKING,
        scaleName: categoryName || ageCategoryCode,
        eventType,
      };

      ({ scaledEntries } = getScaledEntries({
        scaleAttributes: rankingScaleAttributes,
        tournamentRecord,
        stageSequence,
        entries,
        stage,
      }));
    }

    const scaledEntriesCount = scaledEntries?.length || 0;
    if (scaledEntriesCount < seedsCount) seedsCount = scaledEntriesCount;

    scaledEntries
      ?.filter(({ participantId }) =>
        enteredParticipantIds.includes(participantId)
      )
      .slice(0, assignSeedsCount || seedsCount)
      .forEach((scaledEntry, index) => {
        const seedNumber = index + 1;
        const { participantId, scaleValue } = scaledEntry;
        const seedValue =
          seedAssignmentProfile?.[seedNumber] || scaleValue || seedNumber;
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

  let conflicts: any[] = [];
  let positionAssignments;
  let positioningReport;

  if (
    automated !== false &&
    drawType !== AD_HOC &&
    !(qualifyingOnly && stage !== QUALIFYING)
  ) {
    const seedsOnly = typeof automated === 'object' && automated.seedsOnly;
    // if { seedsOnly: true } then only seeds and an Byes releated to seeded positions are placed
    const result = automatedPositioning({
      inContextDrawMatchUps,
      multipleStructures,
      tournamentRecord,
      appliedPolicies,
      drawDefinition,
      seedingProfile,
      participants,
      structureId,
      matchUpsMap,
      placeByes,
      seedLimit,
      seedsOnly,
      drawSize,
      drawType,
      event,
    });
    if (result.conflicts) conflicts = result?.conflicts;
    positionAssignments = result?.positionAssignments;
    positioningReport = result?.positioningReport;

    if (result.error) {
      return decorateResult({ result, stack: 'prepareStage' });
    }
  }

  return {
    positionAssignments,
    positioningReport,
    stageEntries,
    structureId,
    seedsCount,
    conflicts,
  };
}

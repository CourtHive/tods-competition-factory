import { initializeStructureSeedAssignments } from '../../drawEngine/governors/positionGovernor/initializeSeedAssignments';
import { automatedPositioning } from '../../drawEngine/governors/positionGovernor/automatedPositioning';
import { getScaledEntries } from '../governors/eventGovernor/entries/getScaledEntries';
import { assignSeed } from '../../drawEngine/governors/entryGovernor/seedAssignment';
import { findExtension } from '../governors/queryGovernor/extensionQueries';
import { getDrawStructures } from '../../drawEngine/getters/findStructure';
import { getParticipantId } from '../../global/functions/extractors';

import { STRUCTURE_SELECTED_STATUSES } from '../../constants/entryStatusConstants';
import { RANKING, SEEDING } from '../../constants/scaleConstants';
import { ROUND_TARGET } from '../../constants/extensionConstants';

export function prepareStage({
  preparedStructureIds = [],
  inContextDrawMatchUps,
  tournamentRecord,
  drawDefinition,
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
  seedsCount,

  stageSequence = 1,
  roundTarget,
  stage,
}) {
  const eventType = event?.eventType;
  const stageEntries = entries.filter((entry) => {
    const entryRoundTarget = findExtension({
      element: entry,
      name: ROUND_TARGET,
    })?.extension?.value;

    return (
      (!entry.entryStage || entry.entryStage === stage) &&
      (!stageSequence ||
        !entry.entryStageSequence ||
        entry.entryStageSequence === stageSequence) &&
      (!roundTarget || entryRoundTarget === roundTarget) &&
      STRUCTURE_SELECTED_STATUSES.includes(entry.entryStatus)
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
  const multipleStructures = structures.length > 1;

  const structure = structures.find(
    ({ structureId }) => !preparedStructureIds.includes(structureId)
  );
  const { structureId } = structure || {};

  const { seedLimit } = initializeStructureSeedAssignments({
    participantCount: stageEntries.length,
    enforcePolicyLimits,
    tournamentRecord,
    drawDefinition,
    structureId,
    seedsCount,
    event,
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
          drawDefinition,
          participantId,
          structureId,
          seedNumber,
          seedValue,
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

    scaledEntries &&
      scaledEntries
        .filter(({ participantId }) =>
          enteredParticipantIds.includes(participantId)
        )
        .slice(0, assignSeedsCount || seedsCount)
        .forEach((scaledEntry, index) => {
          const seedNumber = index + 1;
          const seedValue = (
            seedAssignmentProfile?.[seedNumber] || seedNumber
          )?.toString();
          // ?? attach basis of seeding information to seedAssignment ??
          const { participantId } = scaledEntry;
          assignSeed({
            drawDefinition,
            participantId,
            structureId,
            seedNumber,
            seedValue,
          });
        });
  }

  let conflicts = [];
  let positionAssignments;
  if (automated !== false) {
    const seedsOnly = typeof automated === 'object' && automated.seedsOnly;
    // if { seedsOnly: true } then only seeds and an Byes releated to seeded positions are placed
    const result = automatedPositioning({
      inContextDrawMatchUps,
      multipleStructures,
      tournamentRecord,
      drawDefinition,
      participants,
      structureId,
      matchUpsMap,
      placeByes,
      seedsOnly,
      drawType,
      event,
    });
    conflicts = result?.conflicts;
    positionAssignments = result?.positionAssignments;
    if (result.error) {
      // console.log(result.error);
      return result;
    }
  }

  return {
    positionAssignments,
    stageEntries,
    structureId,
    seedsCount,
    conflicts,
  };
}

import { initializeStructureSeedAssignments } from '../../drawEngine/governors/positionGovernor/initializeSeedAssignments';
import { getScaledEntries } from '../governors/eventGovernor/entries/getScaledEntries';
import { assignSeed } from '../../drawEngine/governors/entryGovernor/seedAssignment';

import { STRUCTURE_SELECTED_STATUSES } from '../../constants/entryStatusConstants';
import { RANKING, SEEDING } from '../../constants/scaleConstants';

export function seedStructure({
  tournamentRecord,
  drawDefinition,
  structureId,
  eventType,
  entries,
  event,

  enteredParticipantIds,
  seedAssignmentProfile,
  enforcePolicyLimits,
  seededParticipants,
  assignSeedsCount,
  seedingScaleName,
  seedByRanking,
  seedsCount,
  stage,
}) {
  const stageEntries = entries.filter(
    (entry) =>
      (!entry.entryStage || entry.entryStage === stage) &&
      STRUCTURE_SELECTED_STATUSES.includes(entry.entryStatus)
  );
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
  } else if (event?.category || seedingScaleName) {
    // if no seededParticipants have been defined, seed by seeding scale or ranking scale, if present

    const { categoryName, ageCategoryCode } = event?.category || {};

    const seedingScaleAttributes = {
      scaleType: SEEDING,
      scaleName: seedingScaleName || categoryName || ageCategoryCode,
      eventType,
    };

    let { scaledEntries } = getScaledEntries({
      scaleAttributes: seedingScaleAttributes,
      tournamentRecord,
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
          const seedValue = seedAssignmentProfile?.[seedNumber] || seedNumber;
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
}

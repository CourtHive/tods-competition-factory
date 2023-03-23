import { findExtension } from '../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { modifyEntryProfile } from '../governors/entryGovernor/modifyEntryProfile';
import { getEntryProfile } from './getEntryProfile';
import { findStructure } from './findStructure';

import { ROUND_TARGET, TALLY } from '../../constants/extensionConstants';
import {
  POSITION,
  CONTAINER,
  PLAY_OFF,
  validStages,
} from '../../constants/drawDefinitionConstants';
import {
  ALTERNATE,
  FEED_IN,
  WILDCARD,
  DIRECT_ENTRY_STATUSES,
} from '../../constants/entryStatusConstants';

export function stageExists({ stage, drawDefinition }) {
  const { entryProfile } = getEntryProfile({ drawDefinition });
  const exists = Object.keys(entryProfile).includes(stage);
  if (!exists && validStages.includes(stage)) {
    const attributes = [
      {
        [stage]: {
          drawSize: undefined,
          alternates: true,
        },
      },
    ];
    modifyEntryProfile({ drawDefinition, attributes });
    return true;
  }
  return exists;
}

export function stageStructures({ stage, drawDefinition, stageSequence }) {
  return (
    drawDefinition &&
    stage &&
    drawDefinition.structures &&
    drawDefinition.structures.filter((structure) => {
      return (
        structure.stage === stage && structure.stageSequence === stageSequence
      );
    })
  );
}

export function stageAlternatesCount({ stage, drawDefinition }) {
  const { entryProfile } = getEntryProfile({ drawDefinition });
  return entryProfile[stage]?.alternates || 0;
}
export function getStageWildcardsCount({ stage, drawDefinition }) {
  const { entryProfile } = getEntryProfile({ drawDefinition });
  return entryProfile[stage]?.wildcardsCount || 0;
}
export function getStageEntryTypeCount({ stage, drawDefinition, entryStatus }) {
  return drawDefinition.entries.reduce(
    (p, c) =>
      c.entryStage === stage && c.entryStatus === entryStatus ? p + 1 : p,
    0
  );
}
export function stageSeededEntries({ stage, drawDefinition }) {
  return drawDefinition.entries.reduce(
    (p, c) => (c.entryStage === stage && c.seed ? p.concat(c) : p),
    []
  );
}

/**
 *
 * @param {string[]} entryTypes - ENUM - entry status, e.g. DIRECT_ACCEPTANCE, WILDCARD
 * @param {object} drawDefinition
 * @param {string} stage - ENUM - QUALIFYING, MAIN, PLAY_OFF, CONSOLATION
 * @param {string[]} stages - ENUM - QUALIFYING, MAIN, PLAY_OFF, CONSOLATION
 * @param {number} stageSequence - sequence within a stage
 * @param {string} structureId - optional; used for round robin participant results
 *
 */
export function getStageEntries({
  provisionalPositioning,
  drawDefinition,
  stageSequence,
  entryStatuses,
  structureId,
  roundTarget,
  stages,
  stage,
}) {
  const entries =
    drawDefinition.entries?.reduce((entries, entry) => {
      const entryRoundTarget = findExtension({
        name: ROUND_TARGET,
        element: entry,
      })?.extension?.value;
      const stageTarget =
        (stage && entry.entryStage === stage) ||
        (stages?.length && stages.includes(entry.entryStage));
      const matchesEntryType =
        !entryStatuses || entryStatuses.includes(entry.entryStatus);
      const entryStageSequence = entry.entryStageSequence || 1; // default to 1 if not present
      const sameStageSequence =
        !stageSequence || entryStageSequence === stageSequence;
      const targetMatch =
        !roundTarget || !entryRoundTarget || roundTarget === entryRoundTarget;

      return stageTarget && sameStageSequence && matchesEntryType && targetMatch
        ? entries.concat(entry)
        : entries;
    }, []) || [];

  // handle POSITION entries
  if (structureId && stage === PLAY_OFF) {
    const { playoffEntries, error } = getPlayoffEntries({
      provisionalPositioning,
      drawDefinition,
      structureId,
    });
    if (error) {
      console.log('playoff entries error'); // TODO: bubble this up...
    }
    return playoffEntries?.length ? playoffEntries : entries;
  }
  return entries;
}

/**
 *
 * @param {object} drawDefinition
 * @param {string} structureId - id of structure within drawDefinition
 *
 */
function getPlayoffEntries({
  provisionalPositioning,
  drawDefinition,
  structureId,
}) {
  const playoffEntries = [];
  const inboundLink = (drawDefinition.links || []).find(
    (link) =>
      link.linkType === POSITION && link.target.structureId === structureId
  );
  if (inboundLink) {
    // links from round robins include an array of finishing positions
    // which qualify participants to travel across a link to a playoff structure
    const { finishingPositions, structureId } = inboundLink.source;

    const { structure: sourceStructure } = findStructure({
      drawDefinition,
      structureId,
    });

    // for group participant results to be tallied,
    // the source structure must be a container of other structures
    if (sourceStructure.structureType === CONTAINER) {
      const playoffStructures = sourceStructure.structures || [];
      playoffStructures.forEach((structure) => {
        const { positionAssignments } = structure;
        const { structureId: playoffStructureId } = structure;
        const groupingValue = playoffStructureId;

        const results = Object.assign(
          {},
          ...positionAssignments
            .map((assignment) => {
              const { participantId } = assignment;
              const results = findExtension({
                element: assignment,
                name: TALLY,
              }).extension?.value;
              return results ? { [participantId]: results } : undefined;
            })
            .filter(Boolean)
        );
        const participantIds = Object.keys(results).filter((key) => {
          const result = results[key];
          const finishingPosition =
            result.groupOrder ||
            (provisionalPositioning && result.provisionalOrder);
          return finishingPositions.includes(finishingPosition);
        });

        participantIds.forEach((participantId) => {
          const participantResult = results[participantId];
          const { groupOrder, provisionalOrder, GEMscore } = participantResult;
          const finishingPosition =
            groupOrder || (provisionalPositioning && provisionalOrder);
          const placementGroup =
            finishingPositions.sort().indexOf(finishingPosition) + 1;

          playoffEntries.push({
            entryStage: PLAY_OFF,
            entryStatus: FEED_IN,
            placementGroup,
            groupingValue,
            participantId,
            GEMscore,
          });
        });
      });
    }
  }

  return { playoffEntries };
}

export function getStageDirectEntriesCount({ stage, drawDefinition }) {
  return DIRECT_ENTRY_STATUSES.reduce((count, entryStatus) => {
    const statusCount = getStageEntryTypeCount({
      drawDefinition,
      entryStatus,
      stage,
    });
    return (statusCount || 0) + count;
  }, 0);
}
export function getStageWildcardEntriesCount({ stage, drawDefinition }) {
  return getStageEntryTypeCount({
    entryStatus: WILDCARD,
    drawDefinition,
    stage,
  });
}
export function stageAlternateEntries({ stage, drawDefinition }) {
  return getStageEntryTypeCount({
    entryStatus: ALTERNATE,
    drawDefinition,
    stage,
  });
}

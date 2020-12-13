import { tallyParticipantResults } from '../governors/scoreGovernor/roundRobinTally';
import { getAllStructureMatchUps } from './getMatchUps';
import { findStructure } from './findStructure';

import {
  ALTERNATE,
  FEED_IN,
  WILDCARD,
  DIRECT_ACCEPTANCE,
} from '../../constants/entryStatusConstants';
import {
  POSITION,
  CONTAINER,
  PLAY_OFF,
} from '../../constants/drawDefinitionConstants';

import { SUCCESS } from '../../constants/resultConstants';

export function validStage({ stage, drawDefinition }) {
  return Boolean(
    stageExists({ stage, drawDefinition }) &&
      stageDrawPositionsCount({ stage, drawDefinition })
  );
}
export function stageExists({ stage, drawDefinition }) {
  return (
    drawDefinition &&
    stage &&
    Object.keys(drawDefinition.entryProfile).includes(stage)
  );
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
export function getStageDrawPositions({ stage, drawDefinition }) {
  const entryProfile = drawDefinition.entryProfile[stage];
  return (entryProfile && entryProfile.drawSize) || 0;
}
export function stageDrawPositionsCount({ stage, drawDefinition }) {
  return drawDefinition && stage && drawDefinition.entryProfile[stage].drawSize;
}
export function getStageQualifiersCount({ stage, drawDefinition }) {
  const entryProfile = drawDefinition.entryProfile[stage];
  return (entryProfile && entryProfile.qualifiersCount) || 0;
}

// drawSize - qualifyingPositions
export function getStageDrawPositionsAvailable({ stage, drawDefinition }) {
  const drawSize = stageDrawPositionsCount({ stage, drawDefinition });
  const qualifyingPositions = getStageQualifiersCount({
    stage,
    drawDefinition,
  });
  return drawSize && drawSize - qualifyingPositions;
}
export function stageAlternates({ stage, drawDefinition }) {
  return drawDefinition.entryProfile[stage].alternates;
}
export function getStageWildcardsCount({ stage, drawDefinition }) {
  return drawDefinition.entryProfile[stage].wildcardsCount || 0;
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
 * @param {number} stageSequence - sequence within a stage
 *
 * @param {string} structureId - optional; used for round robin participant results
 *
 */
export function stageEntries({
  entryTypes,
  drawDefinition,
  stageSequence,
  stage,

  structureId,
}) {
  const entries =
    drawDefinition.entries?.reduce((p, c) => {
      const sameStage = c.entryStage === stage;
      const matchesEntryType =
        !entryTypes || entryTypes.includes(c.entryStatus);
      const entryStageSequence = c.stageSequence || 1; // default to 1 if not present
      const sameStageSequence =
        !stageSequence || entryStageSequence === stageSequence;
      return sameStage && sameStageSequence && matchesEntryType
        ? p.concat(c)
        : p;
    }, []) || [];

  // handle POSITION entries
  if (structureId && !entries.length) {
    return playoffEntries({ drawDefinition, structureId });
  }
  return entries;
}

/**
 *
 * @param {object} drawDefinition
 * @param {string} structureId - id of structure within drawDefinition
 *
 */
export function playoffEntries({ drawDefinition, structureId }) {
  const entries = [];
  const inboundLink = drawDefinition.links.find(
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
        const { structureId: playoffStructureId } = structure;

        // context is required so that matchUp.sides are present
        // TODO: creates circular dependency... use structure.stats attribute for participantResults?
        const { matchUps } = getAllStructureMatchUps({
          structure,
          drawDefinition,
          inContext: true,
        });
        const matchUpFormat =
          sourceStructure.matchUpFormat ||
          (matchUps?.length && matchUps[0].matchUpFormat);
        const { participantResults } = tallyParticipantResults({
          matchUpFormat,
          matchUps,
        });

        const groupingValue = playoffStructureId;
        Object.keys(participantResults)
          .filter((key) => {
            const result = participantResults[key];
            return finishingPositions.includes(result.groupOrder);
          })
          .forEach((participantId) => {
            const participantResult = participantResults[participantId];
            const { groupOrder, GEMscore } = participantResult;
            const placementGroup =
              finishingPositions.sort().indexOf(groupOrder) + 1;

            entries.push({
              GEMscore,
              groupingValue,
              participantId,
              placementGroup,
              entryStage: PLAY_OFF,
              entryStatus: FEED_IN,
            });
          });
      });
    }
  }

  return entries;
}

export function getStageDirectEntriesCount({ stage, drawDefinition }) {
  return getStageEntryTypeCount({
    stage,
    drawDefinition,
    entryStatus: DIRECT_ACCEPTANCE,
  });
}
export function getStageWildcardEntriesCount({ stage, drawDefinition }) {
  return getStageEntryTypeCount({
    stage,
    drawDefinition,
    entryStatus: WILDCARD,
  });
}
export function stageAlternateEntries({ stage, drawDefinition }) {
  return getStageEntryTypeCount({
    stage,
    drawDefinition,
    entryStatus: ALTERNATE,
  });
}
export function stageSpace({
  stage,
  drawDefinition,
  entryStatus = DIRECT_ACCEPTANCE,
}) {
  if (entryStatus === ALTERNATE) {
    if (stageAlternates({ stage, drawDefinition })) {
      return Object.assign({ positionsAvailable: Infinity }, SUCCESS);
    } else {
      return { error: 'Alternates not allowed in stage' };
    }
  }

  const stageDrawPositionsAvailable = getStageDrawPositionsAvailable({
    stage,
    drawDefinition,
  });
  const wildcardPositions = getStageWildcardsCount({ stage, drawDefinition });
  const wildcardEntriesCount = getStageEntryTypeCount({
    stage,
    drawDefinition,
    entryStatus: WILDCARD,
  });
  const directEntriesCount = getStageEntryTypeCount({
    stage,
    drawDefinition,
    entryStatus: DIRECT_ACCEPTANCE,
  });
  const totalEntriesCount = wildcardEntriesCount + directEntriesCount;
  const stageFull = totalEntriesCount >= stageDrawPositionsAvailable;
  const positionsAvailable = stageDrawPositionsAvailable - totalEntriesCount;

  if (stageFull) return { error: 'No Space Available' };

  if (entryStatus === WILDCARD) {
    if (wildcardEntriesCount < wildcardPositions) return SUCCESS;
    return { error: 'No Wildcard space available' };
  }

  return Object.assign({ positionsAvailable }, SUCCESS);
}

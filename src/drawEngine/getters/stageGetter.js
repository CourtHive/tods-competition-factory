import {
  ALTERNATE,
  WILDCARD,
  DIRECT_ACCEPTANCE,
  POSITION,
  CONTAINER,
} from '../../constants/drawDefinitionConstants';

import { SUCCESS } from '../../constants/resultConstants';
import { tallyParticipantResults } from '../governors/scoreGovernor/roundRobinTally';
import { findStructure } from './findStructure';
import { getAllStructureMatchUps } from './getMatchUps';

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
    drawDefinition.structures.filter(structure => {
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
export function stageEntries({
  stage,
  stageSequence,
  drawDefinition,
  participants,
  structureId,
  entryTypes,
}) {
  const entries = drawDefinition.entries.reduce((p, c) => {
    const sameStage = c.entryStage === stage;
    const matchesEntryType = !entryTypes || entryTypes.includes(c.entryStatus);
    const entryStageSequence = c.stageSequence || 1; // default to 1 if not present
    const sameStageSequence =
      !stageSequence || entryStageSequence === stageSequence;
    return sameStage && sameStageSequence && matchesEntryType ? p.concat(c) : p;
  }, []);

  // handle POSITION entries
  if (structureId && !entries.length) {
    const inboundLink = drawDefinition.links.find(
      link =>
        link.linkType === POSITION && link.target.structureId === structureId
    );
    if (inboundLink) {
      const { finishingPositions, structureId } = inboundLink.source;
      const { structure: sourceStructure } = findStructure({
        drawDefinition,
        structureId,
      });
      console.log({ finishingPositions });
      if (sourceStructure.structureType === CONTAINER) {
        sourceStructure.structures.forEach(structure => {
          const { matchUps } = getAllStructureMatchUps({
            structure,
            drawDefinition,
            inContext: true,
            tournamentParticipants: participants,
          });
          const matchUpFormat =
            sourceStructure.matchUpFormat ||
            (matchUps?.length && matchUps[0].matchUpFormat);
          const { participantResults } = tallyParticipantResults({
            matchUpFormat,
            matchUps,
          });
          const enteredParticipants = Object.keys(participantResults).filter(
            key => {
              const result = participantResults[key];
              return finishingPositions.includes(result.groupOrder);
            }
          );
          console.log({ enteredParticipants });
        });
      }
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

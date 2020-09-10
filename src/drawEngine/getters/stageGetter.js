import {
  ALTERNATE,
  WILDCARD,
  DIRECT_ACCEPTANCE,
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
export function getStageEntryTypeCount({ stage, drawDefinition, entryType }) {
  return drawDefinition.entries.reduce(
    (p, c) => (c.entryStage === stage && c.entryType === entryType ? p + 1 : p),
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
  entryTypes,
}) {
  return drawDefinition.entries.reduce((p, c) => {
    const sameStage = c.entryStage === stage;
    const matchesEntryType = !entryTypes || entryTypes.includes(c.entryType);
    const entryStageSequence = c.stageSequence || 1; // default to 1 if not present
    const sameStageSequence =
      !stageSequence || entryStageSequence === stageSequence;
    return sameStage && sameStageSequence && matchesEntryType ? p.concat(c) : p;
  }, []);
}
export function getStageDirectEntriesCount({ stage, drawDefinition }) {
  return getStageEntryTypeCount({
    stage,
    drawDefinition,
    entryType: DIRECT_ACCEPTANCE,
  });
}
export function getStageWildcardEntriesCount({ stage, drawDefinition }) {
  return getStageEntryTypeCount({ stage, drawDefinition, entryType: WILDCARD });
}
export function stageAlternateEntries({ stage, drawDefinition }) {
  return getStageEntryTypeCount({
    stage,
    drawDefinition,
    entryType: ALTERNATE,
  });
}
export function stageSpace({
  stage,
  drawDefinition,
  entryType = DIRECT_ACCEPTANCE,
}) {
  if (entryType === ALTERNATE) {
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
    entryType: WILDCARD,
  });
  const directEntriesCount = getStageEntryTypeCount({
    stage,
    drawDefinition,
    entryType: DIRECT_ACCEPTANCE,
  });
  const totalEntriesCount = wildcardEntriesCount + directEntriesCount;
  const stageFull = totalEntriesCount >= stageDrawPositionsAvailable;
  const positionsAvailable = stageDrawPositionsAvailable - totalEntriesCount;

  if (stageFull) return { error: 'No Space Available' };

  if (entryType === WILDCARD) {
    if (wildcardEntriesCount < wildcardPositions) return SUCCESS;
    return { error: 'No Wildcard space available' };
  }

  return Object.assign({ positionsAvailable }, SUCCESS);
}

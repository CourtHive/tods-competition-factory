import { getStageDrawPositionsCount } from '../../getters/getStageDrawPositions';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { getQualifiersCount } from '../../getters/getQualifiersCount';
import { modifyEntryProfile } from './modifyEntryProfile';
import {
  stageExists,
  getStageDirectEntriesCount,
  getStageWildcardEntriesCount,
} from '../../getters/stageGetter';

import { ALTERNATE } from '../../../constants/entryStatusConstants';
import { MAIN } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  DRAW_SIZE_MISMATCH,
  INVALID_STAGE,
  MISSING_DRAW_DEFINITION,
} from '../../../constants/errorConditionConstants';

export function setStageDrawSize({
  stageSequence = 1,
  drawDefinition,
  drawSize,
  stage,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!stageExists({ drawDefinition, stage })) {
    return { error: INVALID_STAGE };
  }

  const directAcceptanceEntries = getStageDirectEntriesCount({
    drawDefinition,
    stage,
  });

  const qualifyingPositions = getQualifiersCount({
    drawDefinition,
    stageSequence,
    stage,
  });
  const totalStageDrawPositions = directAcceptanceEntries + qualifyingPositions;

  if (drawSize < totalStageDrawPositions) {
    return {
      error: DRAW_SIZE_MISMATCH,
    };
  }

  const { entryProfile } = modifyEntryProfile({
    attributes: [{ [stage]: { drawSize } }],
    drawDefinition,
  });

  modifyDrawNotice({ drawDefinition });
  return { ...SUCCESS, entryProfile };
}

export function setStageAlternatesCount({
  drawDefinition,
  stage,
  alternatesCount,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!stageExists({ drawDefinition, stage })) {
    return { error: INVALID_STAGE };
  }

  modifyEntryProfile({
    attributes: [{ [stage]: { alternates: alternatesCount } }],
    drawDefinition,
  });

  if (!alternatesCount) {
    drawDefinition.entries =
      drawDefinition.entries?.filter((entry) => {
        return entry.entryStatus !== ALTERNATE;
      }) || [];
  }

  modifyDrawNotice({ drawDefinition });
  return { ...SUCCESS };
}

export function setStageWildcardsCount({
  wildcardsCount = 0,
  drawDefinition,
  stageSequence,
  stage,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!stageExists({ drawDefinition, stage })) {
    return { error: INVALID_STAGE };
  }

  const stageDrawPositions = getStageDrawPositionsCount({
    drawDefinition,
    stage,
  });

  // REMOVE dependency... use link to derive... requires structureId
  const qualifyingPositions = getQualifiersCount({
    drawDefinition,
    stageSequence,
    stage,
  });
  const wildcardEntriesCount = getStageWildcardEntriesCount({
    drawDefinition,
    stage,
  });
  const directAcceptanceEntriesCount = getStageDirectEntriesCount({
    drawDefinition,
    stage,
  });

  if (wildcardsCount < wildcardEntriesCount) {
    const error = Object.assign(DRAW_SIZE_MISMATCH, {
      message:
        'Number of Wildcards cannot be less than number of Wildcards already entered',
    });
    return { error };
  }

  const totalStageEntriesCount =
    directAcceptanceEntriesCount + wildcardsCount + qualifyingPositions;
  if (totalStageEntriesCount > stageDrawPositions) {
    const error = Object.assign(DRAW_SIZE_MISMATCH, {
      message: 'Total stage Entries cannot be greater than drawPositions',
    });
    return { error };
  }

  modifyEntryProfile({
    attributes: [{ [stage]: { wildcardsCount } }],
    drawDefinition,
  });

  modifyDrawNotice({ drawDefinition });
  return { ...SUCCESS };
}

export function setStageQualifiersCount({
  qualifiersCount = 0,
  drawDefinition,
  stage,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!stageExists({ drawDefinition, stage })) {
    return { error: INVALID_STAGE };
  }
  if (stage !== MAIN) {
    const error = Object.assign(DRAW_SIZE_MISMATCH, {
      message: 'qualifiersCount can only be set for main stage',
    });
    return { error };
  }

  const stageDrawPositions = getStageDrawPositionsCount({
    drawDefinition,
    stage,
  });
  const wildcardEntriesCount = getStageWildcardEntriesCount({
    drawDefinition,
    stage,
  });
  const directAcceptanceEntriesCount = getStageDirectEntriesCount({
    drawDefinition,
    stage,
  });
  const totalStageDrawPositions =
    directAcceptanceEntriesCount + wildcardEntriesCount + qualifiersCount;

  if (totalStageDrawPositions > stageDrawPositions) {
    const error = Object.assign(DRAW_SIZE_MISMATCH, {
      message: 'Total stage Entries cannot be greater than drawPositions',
    });
    return { error };
  }

  modifyEntryProfile({
    attributes: [{ [stage]: { qualifiersCount } }],
    drawDefinition,
  });

  modifyDrawNotice({ drawDefinition });

  return { ...SUCCESS };
}

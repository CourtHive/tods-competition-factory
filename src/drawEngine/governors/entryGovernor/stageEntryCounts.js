import { modifyEntryProfile } from './modifyEntryProfile';
import {
  stageExists,
  getStageDrawPositionsCount,
  getStageQualifiersCount,
  getStageDirectEntriesCount,
  getStageWildcardEntriesCount,
} from '../../getters/stageGetter';

import {
  INVALID_STAGE,
  MISSING_DRAW_DEFINITION,
} from '../../../constants/errorConditionConstants';
import { MAIN } from '../../../constants/drawDefinitionConstants';
import { ALTERNATE } from '../../../constants/entryStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function setStageDrawSize({ drawDefinition, stage, drawSize }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!stageExists({ drawDefinition, stage })) return { error: INVALID_STAGE };

  const directAcceptanceEntries = getStageDirectEntriesCount({
    drawDefinition,
    stage,
  });
  const qualifyingPositions = getStageQualifiersCount({
    drawDefinition,
    stage,
  });
  const totalStageDrawPositions = directAcceptanceEntries + qualifyingPositions;

  if (drawSize < totalStageDrawPositions) {
    return {
      error: 'Cannot set drawSize to be less than existing entries',
    };
  }

  modifyEntryProfile({
    drawDefinition,
    attributes: [{ [stage]: { drawSize } }],
  });

  return SUCCESS;
}

export function setStageAlternatesCount({
  drawDefinition,
  stage,
  alternatesCount,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!stageExists({ drawDefinition, stage })) return { error: INVALID_STAGE };

  modifyEntryProfile({
    drawDefinition,
    attributes: [{ [stage]: { alternates: alternatesCount } }],
  });

  if (!alternatesCount) {
    drawDefinition.entries =
      drawDefinition.entries?.filter((entry) => {
        return entry.entryStatus !== ALTERNATE;
      }) || [];
  }

  return SUCCESS;
}

export function setStageWildcardsCount({
  drawDefinition,
  stage,
  wildcardsCount = 0,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!stageExists({ drawDefinition, stage })) return { error: INVALID_STAGE };

  const stageDrawPositions = getStageDrawPositionsCount({
    drawDefinition,
    stage,
  });
  const qualifyingPositions = getStageQualifiersCount({
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

  if (wildcardsCount < wildcardEntriesCount) {
    return {
      error:
        'Number of Wildcards cannot be less than number of Wildcards already entered',
    };
  }

  const totalStageEntriesCount =
    directAcceptanceEntriesCount + wildcardsCount + qualifyingPositions;
  if (totalStageEntriesCount > stageDrawPositions) {
    return {
      error: 'Total stage Entries cannot be greater than drawPositions',
    };
  }

  modifyEntryProfile({
    drawDefinition,
    attributes: [{ [stage]: { wildcardsCount } }],
  });

  return SUCCESS;
}

export function setStageQualifiersCount({
  drawDefinition,
  stage,
  qualifiersCount = 0,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!stageExists({ drawDefinition, stage })) return { error: INVALID_STAGE };
  if (stage !== MAIN)
    return { error: 'qualifiersCount can only be set for main stage' };

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

  if (totalStageDrawPositions > stageDrawPositions)
    return {
      error: 'Total stage Entries cannot be greater than drawPositions',
    };

  modifyEntryProfile({
    drawDefinition,
    attributes: [{ [stage]: { qualifiersCount } }],
  });

  return SUCCESS;
}

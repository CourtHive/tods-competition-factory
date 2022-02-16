import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { modifyEntryProfile } from './modifyEntryProfile';
import {
  stageExists,
  getStageDrawPositionsCount,
  getStageQualifiersCount,
  getStageDirectEntriesCount,
  getStageWildcardEntriesCount,
} from '../../getters/stageGetter';

import { ALTERNATE } from '../../../constants/entryStatusConstants';
import { MAIN } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
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
  const qualifyingPositions = getStageQualifiersCount({
    drawDefinition,
    stageSequence,
    stage,
  });
  const totalStageDrawPositions = directAcceptanceEntries + qualifyingPositions;

  if (drawSize < totalStageDrawPositions) {
    return {
      error: 'Cannot set drawSize to be less than existing entries',
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
    attributes: [{ [stage]: { qualifiersCount } }],
    drawDefinition,
  });

  modifyDrawNotice({ drawDefinition });

  return { ...SUCCESS };
}

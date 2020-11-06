import {
  stageExists,
  getStageDrawPositions,
  getStageQualifiersCount,
  getStageDirectEntriesCount,
  getStageWildcardEntriesCount,
} from '../../getters/stageGetter';

import {
  INVALID_STAGE,
  MAIN,
  MISSING_DRAW_DEFINITION,
} from '../../../constants/drawDefinitionConstants';

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

  if (drawSize < totalStageDrawPositions)
    return {
      error: 'Cannot set drawSize to be less than existing entries',
    };
  drawDefinition.entryProfile[stage].drawSize = drawSize;
  return SUCCESS;
}

export function setStageAlternates({ drawDefinition, stage, alternates }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!stageExists({ drawDefinition, stage })) return { error: INVALID_STAGE };

  drawDefinition.entryProfile[stage].alternates = alternates;
  if (!alternates) {
    drawDefinition.entries =
      drawDefinition.entries?.filter(entry => {
        return entry.entryStatus !== ALTERNATE;
      }) || [];
  }
}

export function setStageWildcardsCount({
  drawDefinition,
  stage,
  wildcardsCount = 0,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!stageExists({ drawDefinition, stage })) return { error: INVALID_STAGE };

  const stageDrawPositions = getStageDrawPositions({ drawDefinition, stage });
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

  drawDefinition.entryProfile[stage].wildcardsCount = wildcardsCount;
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

  const stageDrawPositions = getStageDrawPositions({ drawDefinition, stage });
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
  drawDefinition.entryProfile[stage].qualifiersCount = qualifiersCount;
  return SUCCESS;
}

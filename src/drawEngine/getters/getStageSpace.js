import { getStageDrawPositionsAvailable } from './getStageDrawPositions';
import {
  getStageEntryTypeCount,
  getStageWildcardsCount,
  stageAlternatesCount,
} from './stageGetter';

import { VOLUNTARY_CONSOLATION } from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  ENTRY_STATUS_NOT_ALLOWED_IN_STAGE,
  NO_STAGE_SPACE_AVAILABLE_FOR_ENTRY_STATUS,
} from '../../constants/errorConditionConstants';
import {
  ALTERNATE,
  DIRECT_ACCEPTANCE,
  WILDCARD,
} from '../../constants/entryStatusConstants';

export function getStageSpace({
  entryStatus = DIRECT_ACCEPTANCE,
  drawDefinition,
  stageSequence,
  stage,
}) {
  if (entryStatus === ALTERNATE) {
    if (stageAlternatesCount({ stage, drawDefinition })) {
      return Object.assign({ positionsAvailable: Infinity }, SUCCESS);
    } else {
      return { error: ENTRY_STATUS_NOT_ALLOWED_IN_STAGE };
    }
  }

  const stageDrawPositionsAvailable = getStageDrawPositionsAvailable({
    drawDefinition,
    stageSequence,
    stage,
  });
  const wildcardPositions = getStageWildcardsCount({
    drawDefinition,
    stageSequence,
    stage,
  });
  const wildcardEntriesCount = getStageEntryTypeCount({
    entryStatus: WILDCARD,
    drawDefinition,
    stageSequence,
    stage,
  });
  const directEntriesCount = getStageEntryTypeCount({
    entryStatus: DIRECT_ACCEPTANCE,
    drawDefinition,
    stageSequence,
    stage,
  });
  const totalEntriesCount = wildcardEntriesCount + directEntriesCount;
  const stageFull = totalEntriesCount >= stageDrawPositionsAvailable;
  const positionsAvailable = stageDrawPositionsAvailable - totalEntriesCount;

  if (stage !== VOLUNTARY_CONSOLATION && stageFull) {
    return { error: NO_STAGE_SPACE_AVAILABLE_FOR_ENTRY_STATUS };
  }

  if (entryStatus === WILDCARD) {
    if (wildcardEntriesCount < wildcardPositions) return { ...SUCCESS };
    return { error: NO_STAGE_SPACE_AVAILABLE_FOR_ENTRY_STATUS };
  }

  return Object.assign({ positionsAvailable }, SUCCESS);
}

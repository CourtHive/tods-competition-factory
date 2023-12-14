import { getStageDrawPositionsAvailable } from './getStageDrawPositions';
import {
  getStageEntryTypeCount,
  getStageWildcardsCount,
  stageAlternatesCount,
} from './stageGetter';

import { VOLUNTARY_CONSOLATION } from '../../constants/drawDefinitionConstants';
import { DrawDefinition } from '../../types/tournamentFromSchema';
import { SUCCESS } from '../../constants/resultConstants';
import {
  ENTRY_STATUS_NOT_ALLOWED_IN_STAGE,
  ErrorType,
  NO_STAGE_SPACE_AVAILABLE_FOR_ENTRY_STATUS,
} from '../../constants/errorConditionConstants';
import {
  ALTERNATE,
  DIRECT_ACCEPTANCE,
  WILDCARD,
} from '../../constants/entryStatusConstants';

type GetStageSpaceArgs = {
  drawDefinition: DrawDefinition;
  stageSequence?: number;
  entryStatus?: string;
  stage: string;
};

export function getStageSpace({
  entryStatus = DIRECT_ACCEPTANCE,
  drawDefinition,
  stageSequence,
  stage,
}: GetStageSpaceArgs): {
  positionsAvailable?: number;
  success?: boolean;
  error?: ErrorType;
} {
  if (entryStatus === ALTERNATE) {
    if (stageAlternatesCount({ stage, drawDefinition })) {
      return { positionsAvailable: Infinity, ...SUCCESS };
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
    stage,
  });
  const wildcardEntriesCount = getStageEntryTypeCount({
    entryStatus: WILDCARD,
    drawDefinition,
    stage,
  });
  const directEntriesCount = getStageEntryTypeCount({
    entryStatus: DIRECT_ACCEPTANCE,
    drawDefinition,
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

  return { positionsAvailable, ...SUCCESS };
}

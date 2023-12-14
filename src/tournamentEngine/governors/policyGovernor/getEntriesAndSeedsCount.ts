import { getEliminationDrawSize } from '../../../drawEngine/getters/getEliminationDrawSize';
import { getStageEntries } from '../../getters/participants/getStageEntries';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getSeedsCount } from './getSeedsCount';

import { PolicyDefinitions } from '../../../types/factoryTypes';
import {
  ErrorType,
  MISSING_EVENT,
} from '../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Event,
  Entry,
  StageTypeEnum,
} from '../../../types/tournamentFromSchema';

type GetEntriesAndSeedsCountArgs = {
  policyDefinitions: PolicyDefinitions;
  drawDefinition: DrawDefinition;
  stage: StageTypeEnum;
  drawSize?: number;
  drawId?: string;
  event: Event;
};
export function getEntriesAndSeedsCount({
  policyDefinitions,
  drawDefinition,
  drawSize,
  drawId,
  event,
  stage,
}: GetEntriesAndSeedsCountArgs): {
  stageEntries?: Entry[];
  seedsCount?: number;
  entries?: Entry[];
  error?: ErrorType;
} {
  if (!event) return { error: MISSING_EVENT };

  const { entries, stageEntries } = getStageEntries({
    drawDefinition,
    drawId,
    stage,
    event,
  });
  const participantsCount = stageEntries.length;

  const { drawSize: eliminationDrawSize } = getEliminationDrawSize({
    participantsCount,
  });
  const result = getSeedsCount({
    drawSize: drawSize ?? eliminationDrawSize,
    participantsCount,
    policyDefinitions,
  });
  if (result.error)
    return decorateResult({ result, stack: 'getEntriesAndSeedsCount' });

  const { seedsCount } = result;
  return { entries, seedsCount, stageEntries };
}

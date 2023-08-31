import { getEliminationDrawSize } from '../../../drawEngine/getters/getEliminationDrawSize';
import { getStageEntries } from '../../getters/participants/getStageEntries';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getSeedsCount } from './getSeedsCount';

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
  drawDefinition: DrawDefinition;
  policyDefinitions: any;
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
  const participantCount = stageEntries.length;

  const { drawSize: eliminationDrawSize } = getEliminationDrawSize({
    participantCount,
  });
  const result = getSeedsCount({
    drawSize: drawSize || eliminationDrawSize,
    policyDefinitions,
    participantCount,
  });
  if (result.error)
    return decorateResult({ result, stack: 'getEntriesAndSeedsCount' });

  const { seedsCount } = result;
  return { entries, seedsCount, stageEntries };
}

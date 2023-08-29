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

/**
 *
 * @param {string} eventId - resolved by tournamentEngine to the event object
 *
 * @param {object} policyDefinitions - seeding policyDefinitions determines the # of seeds for given participantCount/drawSize
 * @param {number} drawSize - OPTIONAL - defaults to calculation based on # of entries
 * @param {string} drawId - OPTIONAL - will use flight.drawEntries or drawDefinition.entries rather than event.entries
 * @param {string} stage - OPTIONAL - filters entries by specified stage
 *
 * @returns {object} - { entries, seedsCount, stageEntries } or { error }
 */
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

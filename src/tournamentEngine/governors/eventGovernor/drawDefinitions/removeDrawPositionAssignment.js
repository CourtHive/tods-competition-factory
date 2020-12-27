import { findEvent } from '../../../getters/eventGetter';
import { clearDrawPosition } from '../../../../drawEngine/governors/positionGovernor/positionClear';

import {
  DRAW_DEFINITION_NOT_FOUND,
  EVENT_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';

/**
 *
 * @param {string} drawId - id of drawDefinition within which structure is found
 * @param {string} structureId - id of structure of drawPosition
 * @param {number} drawPosition - number of drawPosition for which actions are to be returned
 *
 */
export function removeDrawPositionAssignment(props) {
  const { tournamentRecord, drawId } = props;
  const { event, drawDefinition } = findEvent({ tournamentRecord, drawId });

  if (!event) return { error: EVENT_NOT_FOUND };
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };

  return clearDrawPosition(props);
}

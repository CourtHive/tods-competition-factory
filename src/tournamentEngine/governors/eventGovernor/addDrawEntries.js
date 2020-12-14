import { addDrawEntries as addEntries } from '../../../drawEngine/governors/entryGovernor/addingDrawEntries';
import { getDrawDefinition } from '../../getters/eventGetter';

import {
  DRAW_DEFINITION_NOT_FOUND,
  EVENT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function addDrawEntries({
  tournamentRecord,

  participantIds,
  entryStatus,
  entryStage,
  drawId,
}) {
  const { drawDefinition, event } = getDrawDefinition({
    tournamentRecord,
    drawId,
  });
  if (!event) return { error: EVENT_NOT_FOUND };
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };

  return addEntries({ drawDefinition, participantIds, entryStatus, stage });
}

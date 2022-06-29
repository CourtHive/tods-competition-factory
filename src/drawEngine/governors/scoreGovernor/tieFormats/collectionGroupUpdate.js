import { modifyDrawNotice } from '../../../notifications/drawNotifications';
import { updateTargetTeamMatchUps } from './updateTargetTeamMatchUps';
import { definedAttributes } from '../../../../utilities/objects';
import { getTargetTeamMatchUps } from './getTargetTeamMatchUps';
import { calculateWinCriteria } from './calculateWinCriteria';

import { MISSING_DRAW_DEFINITION } from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function collectionGroupUpdate({
  updateInProgressMatchUps,
  originalValueGoal,
  tournamentRecord,
  tieFormatName,
  drawDefinition,
  structureId,
  structure,
  tieFormat,
  matchUpId,
  matchUp,
  eventId,
  event,
}) {
  // calculate new winCriteria for tieFormat
  // if existing winCriteria is aggregateValue, retain
  const { aggregateValue, valueGoal } = calculateWinCriteria(tieFormat);
  tieFormat.winCriteria = { aggregateValue, valueGoal };

  // if valueGoal has changed, force renaming of the tieFormat
  if (originalValueGoal && originalValueGoal !== valueGoal) {
    if (tieFormatName) {
      tieFormat.tieFormatName = tieFormatName;
    } else {
      delete tieFormat.tieFormatName;
    }
  }

  const { targetMatchUps } = getTargetTeamMatchUps({
    updateInProgressMatchUps,
    drawDefinition,
    structureId,
    structure,
    matchUpId,
    matchUp,
  });

  updateTargetTeamMatchUps({
    updateInProgressMatchUps,
    tournamentRecord,
    drawDefinition,
    targetMatchUps,
    tieFormat,
    event,
  });

  const prunedTieFormat = definedAttributes(tieFormat);
  if (eventId) {
    event.tieFormat = prunedTieFormat;
    // NOTE: there is not a modifyEventNotice
  } else if (matchUpId) {
    matchUp.tieFormat = tieFormat;
  } else if (structure) {
    structure.tieFormat = prunedTieFormat;
  } else if (drawDefinition) {
    drawDefinition.tieFormat = prunedTieFormat;
  } else if (!matchUp || !drawDefinition) {
    return { error: MISSING_DRAW_DEFINITION };
  }

  modifyDrawNotice({ drawDefinition, eventId: event?.eventId });

  return { ...SUCCESS };
}

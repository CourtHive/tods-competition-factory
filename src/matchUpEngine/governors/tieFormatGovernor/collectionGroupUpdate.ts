import { modifyDrawNotice } from '../../../drawEngine/notifications/drawNotifications';
import { updateTargetTeamMatchUps } from './updateTargetTeamMatchUps';
import { getTargetTeamMatchUps } from './getTargetTeamMatchUps';
import { definedAttributes } from '../../../utilities/objects';
import { calculateWinCriteria } from './calculateWinCriteria';
import { validateTieFormat } from './tieFormatUtilities';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  DrawDefinition,
  Event,
  MatchUp,
  Structure,
  TieFormat,
  Tournament,
} from '../../../types/tournamentFromSchema';

type CollectionGroupUpdateArgs = {
  updateInProgressMatchUps?: boolean;
  drawDefinition: DrawDefinition;
  tournamentRecord?: Tournament;
  wasAggregateValue?: boolean;
  originalValueGoal?: number;
  tieFormatName?: string;
  structure?: Structure;
  structureId?: string;
  tieFormat: TieFormat;
  matchUpId?: string;
  matchUp?: MatchUp;
  eventId?: string;
  event?: Event;
};
export function collectionGroupUpdate({
  updateInProgressMatchUps,
  originalValueGoal,
  tournamentRecord,
  wasAggregateValue,
  tieFormatName,
  drawDefinition,
  structureId,
  structure,
  tieFormat,
  matchUpId,
  matchUp,
  eventId,
  event,
}: CollectionGroupUpdateArgs) {
  // calculate new winCriteria for tieFormat
  // if existing winCriteria is aggregateValue, retain
  const { aggregateValue, valueGoal } = calculateWinCriteria(tieFormat);
  tieFormat.winCriteria = definedAttributes({ aggregateValue, valueGoal });

  // if valueGoal has changed, force renaming of the tieFormat
  if (
    (originalValueGoal && originalValueGoal !== valueGoal) ||
    (aggregateValue && !wasAggregateValue)
  ) {
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
    targetMatchUps,
    drawDefinition,
    tieFormat,
    event,
  });

  const prunedTieFormat = definedAttributes(tieFormat);
  const result = validateTieFormat({ tieFormat: prunedTieFormat });
  if (result.error) return result;

  // TODO: implement use of tieFormats and tieFormatId
  if (eventId && event) {
    event.tieFormat = prunedTieFormat;
    // NOTE: there is not yet a modifyEventNotice
  } else if (matchUpId && matchUp) {
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

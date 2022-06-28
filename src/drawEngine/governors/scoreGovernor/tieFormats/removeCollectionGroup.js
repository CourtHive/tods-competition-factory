import { getTieFormat } from '../../../../tournamentEngine/getters/getTieFormat';
import { updateTieMatchUpScore } from '../../matchUpGovernor/tieMatchUpScore';
import { definedAttributes } from '../../../../utilities/objects';
import { getTargetTeamMatchUps } from './getTargetTeamMatchUps';
import { calculateWinCriteria } from './calculateWinCriteria';
import { validateTieFormat } from './tieFormatUtilities';
import { copyTieFormat } from './copyTieFormat';
import {
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../../notifications/drawNotifications';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_VALUE,
} from '../../../../constants/errorConditionConstants';

export function removeCollectionGroup({
  updateInProgressMatchUps = true,
  collectionGroupNumber,
  tournamentRecord,
  drawDefinition,
  tieFormatName,
  structureId,
  matchUpId,
  eventId,
  event,
}) {
  if (!collectionGroupNumber) return { error: MISSING_VALUE };
  if (isNaN(collectionGroupNumber)) return { error: INVALID_VALUES };

  let result = getTieFormat({
    tournamentRecord,
    drawDefinition,
    structureId,
    matchUpId,
    eventId,
    event,
  });
  if (result.error) return result;

  const { matchUp, structure, tieFormat: existingTieFormat } = result;
  const originalValueGoal = existingTieFormat.winCriteria.valueGoal;
  const tieFormat = copyTieFormat(existingTieFormat);

  result = validateTieFormat({ tieFormat });
  if (result.error) return result;

  // remove the collectionGroup and all references to it in other collectionDefinitions
  tieFormat.collectionDefinitions = tieFormat.collectionDefinitions.map(
    (collectionDefinition) => {
      const { collectionGroupNumber, ...rest } = collectionDefinition;
      if (collectionGroupNumber) true;
      return rest;
    }
  );
  tieFormat.collectionGroups = tieFormat.collectionGroups.filter(
    ({ groupNumber }) => groupNumber !== collectionGroupNumber
  );

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

  for (const targetMatchUp of targetMatchUps) {
    const hasTieFormat = !!targetMatchUp.tieFormat;
    if (hasTieFormat) {
      targetMatchUp.tieFormat = copyTieFormat(tieFormat);
    }

    let scoreUpdated;
    if (updateInProgressMatchUps) {
      // recalculate score
      const result = updateTieMatchUpScore({
        matchUpId: targetMatchUp.matchUpId,
        exitWhenNoValues: true,
        tournamentRecord,
        drawDefinition,
        event,
      });
      if (result.error) return result;
      scoreUpdated = result.score;
    }

    if (hasTieFormat && !scoreUpdated) {
      console.log('boo', { scoreUpdated, hasTieFormat });

      modifyMatchUpNotice({
        tournamentId: tournamentRecord?.tournamentId,
        eventId: event?.eventId,
        matchUp: targetMatchUp,
        drawDefinition,
      });
    }
  }

  const prunedTieFormat = definedAttributes(tieFormat);
  if (eventId) {
    event.tieFormat = prunedTieFormat;
    // NOTE: there is not a modifyEventNotice
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

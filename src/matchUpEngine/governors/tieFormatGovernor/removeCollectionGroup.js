import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { getTieFormat } from '../../../tournamentEngine/getters/getTieFormat';
import { collectionGroupUpdate } from './collectionGroupUpdate';
import { definedAttributes } from '../../../utilities/objects';
import { tieFormatTelemetry } from './tieFormatTelemetry';
import { validateTieFormat } from './tieFormatUtilities';
import { copyTieFormat } from './copyTieFormat';

import { TIE_FORMAT_MODIFICATIONS } from '../../../constants/extensionConstants';
import {
  INVALID_VALUES,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function removeCollectionGroup({
  updateInProgressMatchUps = true,
  collectionGroupNumber,
  tournamentRecord,
  drawDefinition,
  tieFormatName,
  structureId,
  matchUpId,
  matchUp,
  eventId,
  event,
}) {
  if (!collectionGroupNumber) return { error: MISSING_VALUE };
  if (isNaN(collectionGroupNumber)) return { error: INVALID_VALUES };
  const stack = 'removeCollectionGroup';

  let result =
    !matchUp &&
    getTieFormat({
      tournamentRecord,
      drawDefinition,
      structureId,
      matchUpId,
      eventId,
      event,
    });
  if (result.error) return result;

  const { structure } = result;
  matchUp = matchUp || result.matchUp;
  const existingTieFormat = result.tieFormat || matchUp?.tieFormat;
  const originalValueGoal = existingTieFormat.winCriteria.valueGoal;
  const tieFormat = copyTieFormat(existingTieFormat);

  result = validateTieFormat({ tieFormat });
  if (result.error) return result;

  const modifiedCollectionIds = [];
  // remove the collectionGroup and all references to it in other collectionDefinitions
  tieFormat.collectionDefinitions = tieFormat.collectionDefinitions.map(
    (collectionDefinition) => {
      const { collectionGroupNumber: groupNumber, ...rest } =
        collectionDefinition;
      if (groupNumber !== collectionGroupNumber) {
        return collectionDefinition;
      } else {
        modifiedCollectionIds.push(collectionDefinition.collectionId);
        return rest;
      }
    }
  );
  tieFormat.collectionGroups = tieFormat.collectionGroups.filter(
    ({ groupNumber }) => groupNumber !== collectionGroupNumber
  );

  result = collectionGroupUpdate({
    updateInProgressMatchUps,
    originalValueGoal,
    tournamentRecord,
    drawDefinition,
    tieFormatName,
    structureId,
    structure,
    tieFormat,
    matchUpId,
    matchUp,
    eventId,
    event,
  });

  if (!result.error) {
    const { appliedPolicies } = getAppliedPolicies({ tournamentRecord });
    if (appliedPolicies?.audit?.[TIE_FORMAT_MODIFICATIONS]) {
      const auditData = definedAttributes({
        drawId: drawDefinition?.drawId,
        collectionGroupNumber,
        action: stack,
        structureId,
        matchUpId,
        eventId,
      });
      tieFormatTelemetry({ drawDefinition, auditData });
    }
  }

  return { ...result, modifiedCollectionIds };
}

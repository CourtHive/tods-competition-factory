import { decorateResult } from '../../../global/functions/decorateResult';
import { modifyCollectionDefinition } from './modifyCollectionDefinition';
import { removeCollectionDefinition } from './removeCollectionDefinition';
import { addCollectionDefinition } from './addCollectionDefinition';
import { validateTieFormat } from './tieFormatUtilities';
import { compareTieFormats } from './compareTieFormats';
import { copyTieFormat } from './copyTieFormat';
import { getTieFormat } from './getTieFormat';

import { INVALID_TIE_FORMAT } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function modifyTieFormat({
  updateInProgressMatchUps = false,
  tieFormatComparison,
  modifiedTieFormat,
  tournamentRecord,
  drawDefinition,
  structureId,
  matchUpId,
  eventId,
  uuids,
  event,
}) {
  const stack = 'updateTieFormat';

  if (!validateTieFormat(modifiedTieFormat))
    return { error: INVALID_TIE_FORMAT };

  let result = getTieFormat({
    drawDefinition,
    structureId,
    matchUpId,
    eventId,
    event,
  });
  if (result.error) return decorateResult({ result, stack });

  const { matchUp, tieFormat: existingTieFormat } = result;
  const tieFormat = copyTieFormat(existingTieFormat);

  const existingCollectionIds = tieFormat.collectionDefinitions.map(
    ({ collectionId }) => collectionId
  );

  const modifiedCollectionDefinitions = [];
  const addedCollectionDefinitions = [];
  const updatedCollectionIds = [];

  modifiedTieFormat.collectionDefinitions.forEach((def) => {
    updatedCollectionIds.push(def.collectionId);

    if (existingCollectionIds.includes(def.collectionId)) {
      compareTieFormats({
        descendent: modifiedTieFormat,
        ancestor: tieFormat,
      })?.different && modifiedCollectionDefinitions.push(def);
    } else {
      addedCollectionDefinitions.push(def);
    }
  });

  const removedCollectionIds = existingCollectionIds.filter(
    (collectionId) => !updatedCollectionIds.includes(collectionId)
  );

  const tieFormatName = modifiedTieFormat.tieFormatName;

  let processedTieFormat;

  // TODO: if matchUpCount is changing pre-check for cmopleted tieMatchUps
  // TODO: if gender is changing pre-check for misgendered collectionAssignments
  for (const collectionDefinition of modifiedCollectionDefinitions) {
    const result = modifyCollectionDefinition({
      updateInProgressMatchUps,
      ...collectionDefinition,
      tournamentRecord,
      drawDefinition,
      tieFormatName,
      structureId,
      matchUpId,
      eventId,
      event,
    });
    if (result.error) return decorateResult({ result, stack });
    if (result.tieFormat) processedTieFormat = result.tieFormat;
  }

  for (const collectionDefinition of addedCollectionDefinitions) {
    const result = addCollectionDefinition({
      updateInProgressMatchUps,
      collectionDefinition,
      tournamentRecord,
      drawDefinition,
      tieFormatName,
      structureId,
      matchUpId,
      matchUp,
      eventId,
      uuids,
      event,
    });
    if (result.error) return decorateResult({ result, stack });
    if (result.tieFormat) processedTieFormat = result.tieFormat;
  }

  for (const collectionId of removedCollectionIds) {
    const result = removeCollectionDefinition({
      updateInProgressMatchUps,
      tieFormatComparison,
      tournamentRecord,
      drawDefinition,
      tieFormatName,
      collectionId,
      structureId,
      matchUpId,
      eventId,
      matchUp,
      event,
    });
    if (result.error) return decorateResult({ result, stack });
    if (result.tieFormat) processedTieFormat = result.tieFormat;
  }

  return { ...SUCCESS, processedTieFormat };
}

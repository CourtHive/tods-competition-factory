import { decorateResult } from '../../../global/functions/decorateResult';
import { modifyCollectionDefinition } from './modifyCollectionDefinition';
import { removeCollectionDefinition } from './removeCollectionDefinition';
import { addCollectionDefinition } from './addCollectionDefinition';
import { extractAttributes as xa } from '../../../utilities';
import { numericSortValue } from '../../../utilities/arrays';
import { getTieFormat } from './getTieFormat/getTieFormat';
import { validateTieFormat } from './tieFormatUtilities';
import { compareTieFormats } from './compareTieFormats';
import { copyTieFormat } from './copyTieFormat';

import { INVALID_TIE_FORMAT } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  DrawDefinition,
  Event,
  TieFormat,
  Tournament,
} from '../../../types/tournamentFromSchema';

type ModifyTieFormatArgs = {
  updateInProgressMatchUps?: boolean;
  tieFormatComparison?: boolean;
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  modifiedTieFormat: TieFormat;
  structureId?: string;
  matchUpId?: string;
  eventId?: string;
  uuids?: string[];
  event?: Event;
};

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
}: ModifyTieFormatArgs) {
  const stack = 'updateTieFormat';

  if (!validateTieFormat({ tieFormat: modifiedTieFormat }).valid)
    return { error: INVALID_TIE_FORMAT };

  const result = getTieFormat({
    drawDefinition,
    structureId,
    matchUpId,
    eventId,
    event,
  });
  if (result.error) return decorateResult({ result, stack });

  const { matchUp, tieFormat: existingTieFormat } = result;
  const tieFormat = copyTieFormat(existingTieFormat);

  const comparison = compareTieFormats({
    descendant: modifiedTieFormat,
    ancestor: tieFormat,
  });
  if (comparison.invalid) {
    return decorateResult({
      result: { error: INVALID_TIE_FORMAT },
      context: { invalid: comparison.invalid },
    });
  }
  if (!comparison?.different) {
    return decorateResult({ result: { ...SUCCESS }, info: 'Nothing to do' });
  }

  const existingCollectionIds = tieFormat.collectionDefinitions.map(
    ({ collectionId }) => collectionId
  );
  const updatedCollectionIds = modifiedTieFormat.collectionDefinitions.map(
    ({ collectionId }) => collectionId
  );
  const removedCollectionIds = existingCollectionIds.filter(
    (collectionId) => !updatedCollectionIds.includes(collectionId)
  );

  const addedCollectionDefinitions: any[] =
    modifiedTieFormat.collectionDefinitions.filter(
      ({ collectionId }) => !existingCollectionIds.includes(collectionId)
    );

  const addedCollectionIds = addedCollectionDefinitions.map(xa('collectionId'));

  const modifications: any[] = [];
  let processedTieFormat;

  const tieFormatName = modifiedTieFormat.tieFormatName;
  // TODO: if matchUpCount is changing pre-check for cmopleted tieMatchUps
  // TODO: if gender is changing pre-check for misgendered collectionAssignments
  for (const collectionDefinition of modifiedTieFormat.collectionDefinitions) {
    if (addedCollectionIds.includes(collectionDefinition.collectionId))
      continue;

    const result = modifyCollectionDefinition({
      updateInProgressMatchUps,
      ...collectionDefinition,
      tournamentRecord,
      tieFormatName,
      drawDefinition,
      structureId,
      matchUpId,
      eventId,
      event,
    });
    if (result.modifications) modifications.push(...result.modifications);
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

  const changedTieFormatName =
    existingTieFormat?.tieFormatName !== tieFormatName;

  // if tieFormat has changed, force renaming of the tieFormat
  if (changedTieFormatName) {
    processedTieFormat.tieFormatName = tieFormatName;
    modifications.push({ tieFormatName });
  } else if (
    modifications.length ||
    addedCollectionIds.length ||
    removedCollectionIds.length
  ) {
    delete processedTieFormat.tieFormatName;
    modifications.push(
      'tieFormatName removed: modifications without new tieFormatName'
    );
  }

  processedTieFormat.collectionDefinitions =
    processedTieFormat.collectionDefinitions
      .sort(
        (a, b) =>
          numericSortValue(a.collectionOrder) -
          numericSortValue(b.collectionOrder)
      )
      .map((def, i) => ({ ...def, collectionOrder: i + 1 }));

  return { ...SUCCESS, processedTieFormat, modifications };
}

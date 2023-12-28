import { validateTieFormat } from '../../validators/validateTieFormat';
import { UUID } from '../../utilities/UUID';

import { ResultType } from '../../global/functions/decorateResult';
import { TieFormat } from '../../types/tournamentTypes';

type CheckTieFormatArgs = {
  tieFormat: TieFormat;
};
// add collectionIds if missing
export function checkTieFormat({
  tieFormat,
}: CheckTieFormatArgs): ResultType & { tieFormat?: TieFormat } {
  const result = validateTieFormat({
    checkCollectionIds: false,
    tieFormat,
  });
  if (result.error) return result;

  for (const collectionDefinition of tieFormat.collectionDefinitions) {
    if (!collectionDefinition.collectionId)
      collectionDefinition.collectionId = UUID();
  }

  return { tieFormat };
}

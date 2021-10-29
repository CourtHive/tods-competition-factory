import tieFormatDefaults from '../../tournamentEngine/generators/tieFormatDefaults';
import { UUID } from '../../utilities';

import { DOUBLES, SINGLES } from '../../constants/matchUpTypes';

export function processTieFormat({
  tieFormat,
  tieFormatName,
  drawSize,
  alternatesCount = 0,
}) {
  let maxDoublesCount = 0,
    maxSinglesCount = 0;

  tieFormat =
    typeof tieFormat === 'object'
      ? tieFormat
      : tieFormatDefaults({ namedFormat: tieFormatName });

  tieFormat?.collectionDefinitions?.forEach((collectionDefinition) => {
    // ensure every collectionDefinition has a collectionId
    if (!collectionDefinition.collectionId)
      collectionDefinition.collectionId = UUID();

    if (collectionDefinition?.matchUpType === DOUBLES) {
      const doublesCount = collectionDefinition.matchUpCount;
      maxDoublesCount = Math.max(maxDoublesCount, doublesCount);
    }

    if (collectionDefinition?.matchUpType === SINGLES) {
      const singlescount = collectionDefinition.matchUpCount;
      maxSinglesCount = Math.max(maxSinglesCount, singlescount);
    }
  });

  const teamSize = Math.max(maxSinglesCount, maxDoublesCount * 2);
  const maxDoublesDraw = maxDoublesCount * (drawSize + alternatesCount);
  const maxSinglesDraw = maxSinglesCount * (drawSize + alternatesCount);

  return {
    maxDoublesDraw,
    maxSinglesDraw,
    teamSize,
  };
}

import { DOUBLES_MATCHUP } from '../../../constants/matchUpTypes';

export function getTieFormatDesc(tieFormat) {
  if (!tieFormat) return {};
  const tieFormatName = tieFormat.tieFormatName;
  const collectionDesc = tieFormat.collectionDefinitions
    ?.map((def) => {
      const { matchUpType, matchUpFormat, matchUpCount, category } = def;
      const ageCategoryCode = category?.ageCategoryCode;
      const matchUpTypeCode = matchUpType === DOUBLES_MATCHUP ? 'D' : 'S';
      return [
        matchUpCount,
        matchUpTypeCode,
        ageCategoryCode,
        matchUpFormat,
      ].join(';');
    })
    .join('|');
  return {
    tieFormatName: tieFormat ? tieFormatName || 'UNNAMED' : undefined,
    tieFormatDesc: [collectionDesc].join('='),
  };
}

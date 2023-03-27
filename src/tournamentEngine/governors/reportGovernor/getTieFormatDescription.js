import { DOUBLES_MATCHUP } from '../../../constants/matchUpTypes';

export function getTieFormatDesc(tieFormat) {
  if (!tieFormat) return {};
  const tieFormatName = tieFormat.tieFormatName;
  const tieFormatDesc = tieFormat.collectionDefinitions
    ?.map((def) => {
      const { matchUpType, matchUpFormat, matchUpCount, category, gender } =
        def;
      const ageCategoryCode = category?.ageCategoryCode;
      const matchUpTypeCode = matchUpType === DOUBLES_MATCHUP ? 'D' : 'S';
      return [
        matchUpCount,
        matchUpTypeCode,
        ageCategoryCode,
        matchUpFormat,
        gender,
      ].join(';');
    })
    .join('|');
  return {
    tieFormatName: (tieFormat && tieFormatName) || 'UNNAMED',
    tieFormatDesc,
  };
}

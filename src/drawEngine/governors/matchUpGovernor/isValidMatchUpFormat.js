import { matchUpFormatCode } from 'tods-matchup-format-code';

export function isValidMatchUpFormat(matchUpFormat) {
  if (typeof matchUpFormat !== 'string') return false;
  const parsedFormat = matchUpFormatCode.parse(matchUpFormat);
  return matchUpFormatCode.stringify(parsedFormat) === matchUpFormat;
}

import { stringify } from './stringify';
import { isValid } from './isValid';
import { parse } from './parse';

export const matchUpFormatCode = {
  isValidMatchUpFormatCode: (matchUpFormat) => isValid(matchUpFormat),
  stringify: (matchUpFormatObject) => stringify(matchUpFormatObject),
  isValid: (matchUpFormat) => isValid(matchUpFormat),
  parse: (matchUpFormat) => parse(matchUpFormat),
};

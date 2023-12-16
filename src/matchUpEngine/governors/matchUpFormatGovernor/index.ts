import { isValidMatchUpFormat } from '../../../validators/isValidMatchUpFormat';
import { stringify } from './stringify';
import { parse } from './parse';

export const matchUpFormatCode = {
  isValid: isValidMatchUpFormat,
  isValidMatchUpFormat,
  stringify,
  parse,
};

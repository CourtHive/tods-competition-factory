import { isValidMatchUpFormat } from '../../../validators/isValidMatchUpFormat';
import { stringify } from '../../generators/matchUpFormatCode/stringify';
import { parse } from '../../generators/matchUpFormatCode/parse';

export const matchUpFormatCode = {
  isValid: isValidMatchUpFormat,
  isValidMatchUpFormat,
  stringify,
  parse,
};

export default matchUpFormatCode;

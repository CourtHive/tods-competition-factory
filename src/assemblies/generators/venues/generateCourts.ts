import { checkRequiredParameters } from '../../../parameters/checkRequiredParameters';
import { isTimeString, isValidDateString } from '../../../utilities/dateTime';
import { definedAttributes } from '../../../utilities/definedAttributes';
import { generateRange } from '../../../utilities/arrays';
import { isString } from '../../../utilities/objects';
import { isNumeric } from '../../../utilities/math';
import { UUID } from '../../../utilities/UUID';

import { MISSING_VALUE } from '../../../constants/errorConditionConstants';
import { ResultType } from '../../../global/functions/decorateResult';
import { VALIDATE } from '../../../constants/attributeConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { Court } from '../../../types/tournamentTypes';

type GenerateCourtsArgs = {
  courtNames?: string[];
  namePrefix?: string;
  startTime?: string;
  endTime?: string;
  idPrefix?: string;
  uuids?: string[];
  dates?: string[];
  count: number;
};

type GenerateCourtsResult = {
  courts?: Court[];
};

export function generateCourts(params: GenerateCourtsArgs): ResultType & GenerateCourtsResult {
  if (!params) return { error: MISSING_VALUE };

  const paramCheck = checkRequiredParameters(params, [
    { dates: false, [VALIDATE]: (value) => Array.isArray(value) && value.every(isValidDateString) },
    { uuids: false, [VALIDATE]: (value) => Array.isArray(value) && value.every(isString) },
    { startTime: false, endTime: false, [VALIDATE]: isTimeString },
    { idPrefix: false, namePrefix: false, [VALIDATE]: isString },
    { count: true, [VALIDATE]: isNumeric },
  ]);
  if (paramCheck.error) return paramCheck;

  const courts: Court[] = generateRange(1, params.count + 1).map((courtNumber) =>
    definedAttributes({
      courtId: params.uuids?.pop() ?? (params.idPrefix && `${params.idPrefix}-${courtNumber}`) ?? UUID(),
      courtName: params.courtNames?.pop() ?? (params.namePrefix && `${params.namePrefix} ${courtNumber}`),
      dateAvailability: params.dates?.map((date) => ({
        startTime: params.startTime ?? '08:00',
        endTime: params.endTime ?? '20:00',
        date,
      })),
    }),
  );

  return { ...SUCCESS, courts };
}

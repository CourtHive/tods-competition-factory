import { generateDateRange, isTimeString, isValidDateString } from '../../../tools/dateTime';
import { checkRequiredParameters } from '../../../parameters/checkRequiredParameters';
import { definedAttributes } from '../../../tools/definedAttributes';
import { generateRange } from '../../../tools/arrays';
import { isString } from '../../../tools/objects';
import { isNumeric } from '../../../tools/math';
import { UUID } from '../../../tools/UUID';

import { MISSING_VALUE } from '../../../constants/errorConditionConstants';
import { ResultType } from '../../../functions/global/decorateResult';
import { Court, Tournament } from '../../../types/tournamentTypes';
import { VALIDATE } from '../../../constants/attributeConstants';
import { SUCCESS } from '../../../constants/resultConstants';

type GenerateCourtsArgs = {
  tournamentRecord?: Tournament;
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

  const { startDate, endDate } = params.tournamentRecord ?? {};
  const dates = params.dates || (startDate && endDate && generateDateRange(startDate, endDate)) || [];

  const courts: Court[] = generateRange(1, params.count + 1).map((courtNumber) =>
    definedAttributes({
      courtId: params.uuids?.pop() ?? (params.idPrefix && `${params.idPrefix}-${courtNumber}`) ?? UUID(),
      courtName: params.courtNames?.pop() ?? (params.namePrefix && `${params.namePrefix} ${courtNumber}`),
      dateAvailability: dates.map((date) => ({
        startTime: params.startTime ?? '08:00',
        endTime: params.endTime ?? '20:00',
        date,
      })),
    }),
  );

  return { ...SUCCESS, courts };
}

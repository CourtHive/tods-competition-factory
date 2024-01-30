import { makeDeepCopy } from '@Tools/makeDeepCopy';
import { findCourt } from '@Mutate/venues/findCourt';

import { Tournament } from '@Types/tournamentTypes';
import { SUCCESS } from '@Constants/resultConstants';
import { ErrorType, MISSING_COURT_ID, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';

type GetCourtInfoArgs = {
  tournamentRecord: Tournament;
  internalUse?: boolean;
  courtId: string;
};
export function getCourtInfo({ tournamentRecord, internalUse, courtId }: GetCourtInfoArgs): {
  error?: ErrorType;
  success?: boolean;
  courtInfo?: any;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!courtId) return { error: MISSING_COURT_ID };

  const result = findCourt({ tournamentRecord, courtId });
  if (result.error) return result;

  const courtInfo =
    result.court &&
    (({
      altitude,
      courtId,
      courtName,
      courtDimensions,
      latitude,
      longitude,
      surfaceCategory,
      surfaceType,
      surfacedDate,
      pace,
      notes,
    }) => ({
      altitude,
      courtId,
      courtName,
      courtDimensions,
      latitude,
      longitude,
      surfaceCategory,
      surfaceType,
      surfacedDate,
      pace,
      notes,
    }))(result.court);

  return { ...SUCCESS, courtInfo: makeDeepCopy(courtInfo, false, internalUse) };
}

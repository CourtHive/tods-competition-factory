import { findCourt } from '../../getters/courtGetter';
import { makeDeepCopy } from '../../../utilities';

import { Tournament } from '../../../types/tournamentFromSchema';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  ErrorType,
  MISSING_COURT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

type GetCourtInfoArgs = {
  tournamentRecord: Tournament;
  internalUse?: boolean;
  courtId: string;
};
export function getCourtInfo({
  tournamentRecord,
  internalUse,
  courtId,
}: GetCourtInfoArgs): {
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

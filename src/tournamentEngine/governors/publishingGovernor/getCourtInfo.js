import { findCourt } from '../../getters/courtGetter';
import { makeDeepCopy } from '../../../utilities';

import {
  MISSING_COURT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function getCourtInfo({ tournamentRecord, courtId }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!courtId) return { error: MISSING_COURT_ID };

  const { court, error } = findCourt({ tournamentRecord, courtId });
  if (error) return { error };

  const courtInfo = (({
    altitude,
    courtId,
    courtName,
    courtDimensions,
    latitude,
    longitude,
    surfaceCategory,
    surfaceType,
    surfaceDate,
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
    surfaceDate,
    pace,
    notes,
  }))(court);

  return { ...SUCCESS, courtInfo: makeDeepCopy(courtInfo) };
}

import { filterParticipants } from './filterParticipants';
import { getParticipantMap } from './getParticipantMap';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function getParticipants({
  participantFilters = {},
  convertExtensions,
  tournamentRecord,
  withSignInStatus,
  withScaleValues,
  withISO2,
  withIOC,
  // inContext,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { participantMap } = getParticipantMap({
    convertExtensions,
    tournamentRecord,
    withSignInStatus,
    withScaleValues,
    withISO2,
    withIOC,
  });

  const participants = filterParticipants({
    participants: Object.values(participantMap),
    participantFilters,
    tournamentRecord,
  });

  return { ...SUCCESS, participants };
}

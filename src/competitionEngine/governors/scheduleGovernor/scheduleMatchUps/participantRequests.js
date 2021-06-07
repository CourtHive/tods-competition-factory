import { findExtension } from '../../competitionsGovernor/competitionExtentions';

import { MISSING_TOURNAMENT_RECORDS } from '../../../../constants/errorConditionConstants';
import { PARTICIPANT_REQUESTS } from '../../../../constants/extensionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function getParticipantRequests({ tournamentRecords }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  const { extension } = findExtension({
    tournamentRecords,
    name: PARTICIPANT_REQUESTS,
  });

  const participantRequests = extension?.value || [];

  // audit requests and filter out any that are no longer relevant
  // (tournament dates changed & etc)

  return { participantRequests };
}

export function addParticipantRequest() {
  //

  return SUCCESS;
}

export function removeParticipantRequest() {
  //
  return SUCCESS;
}

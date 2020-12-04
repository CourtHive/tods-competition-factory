import { findCourt } from '../../getters/courtGetter';

import { SUCCESS } from '../../../constants/resultConstants';

export function deleteCourt({ tournamentRecord, courtId, forceDelete }) {
  const { venue } = findCourt({ tournamentRecord, courtId });

  if (forceDelete) {
    // TODO: check whether matchUps will be affected
    // perhaps provide a method to query all matchUps which have timeItems for a given court or venue
    // delete all matchUp timeItems related to this court
  }

  venue.courts = (venue.courts || []).filter(courtRecord => {
    return courtRecord.courtId !== courtId;
  });

  return SUCCESS;
}

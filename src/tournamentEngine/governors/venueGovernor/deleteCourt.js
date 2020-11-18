import { findCourt } from '../../getters/courtGetter';

import { SUCCESS } from '../../../constants/resultConstants';

export function deleteCourt({ tournamentRecord, courtId }) {
  const { venue } = findCourt({ tournamentRecord, courtId });
  venue.courts = (venue.courts || []).filter(courtRecord => {
    return courtRecord.courtId !== courtId;
  });

  return SUCCESS;
}

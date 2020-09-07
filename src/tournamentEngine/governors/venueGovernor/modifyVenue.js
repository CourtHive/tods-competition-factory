import { findCourt } from 'competitionFactory/tournamentEngine/getters/courtGetter';

import { SUCCESS } from "competitionFactory/constants/resultConstants";

export function setVenueAddress({tournamentRecord, venueId, address}) {
  return SUCCESS;
}

export function deleteCourt({tournamentRecord, courtId}) {
  let { venue } = findCourt({tournamentRecord, courtId});
  venue.courts = (venue.courts || []).filter(courtRecord => {
    return courtRecord.courtId !== courtId;
  });
 
  return SUCCESS;
}


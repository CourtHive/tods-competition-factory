import { checkSchedulingProfile } from '../scheduleGovernor/schedulingProfile';
import { addNotice } from '../../../global/state/globalState';
import venueTemplate from '../../generators/venueTemplate';
import { findVenue } from '../../getters/venueGetter';
import { deletionMessage } from './deletionMessage';
import { makeDeepCopy } from '../../../utilities';
import { modifyCourt } from './modifyCourt';
import { addCourt } from './addCourt';
import {
  getScheduledCourtMatchUps,
  getScheduledVenueMatchUps,
} from '../queryGovernor/getScheduledCourtMatchUps';

import { MODIFY_VENUE } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  COURT_NOT_FOUND,
  INVALID_OBJECT,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VENUE_ID,
  NO_VALID_ATTRIBUTES,
} from '../../../constants/errorConditionConstants';

export function modifyVenue({
  tournamentRecord,
  modifications,
  venueId,
  force,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!modifications || typeof modifications !== 'object')
    return { error: INVALID_OBJECT };
  if (!venueId) return { error: MISSING_VENUE_ID };

  const { matchUps: venueMatchUps } = getScheduledVenueMatchUps({
    tournamentRecord,
    venueId,
  });

  const result = findVenue({ tournamentRecord, venueId });
  if (result.error) return result;
  const venue = result.venue;

  // not valid to modify a venueId
  const validAttributes = Object.keys(venueTemplate()).filter(
    (attribute) => attribute !== 'venueId'
  );
  const validModificationAttributes = Object.keys(modifications).filter(
    (attribute) => validAttributes.includes(attribute)
  );

  if (!validModificationAttributes.length)
    return { error: NO_VALID_ATTRIBUTES };

  const validReplacements = validAttributes.filter(
    (attribute) => !['courts', 'onlineResources'].includes(attribute)
  );

  const validReplacementAttributes = Object.keys(modifications).filter(
    (attribute) => validReplacements.includes(attribute)
  );

  validReplacementAttributes.forEach((attribute) =>
    Object.assign(venue, { [attribute]: modifications[attribute] })
  );

  const existingCourtIds = venue?.courts?.map((court) => court.courtId) || [];
  const courtIdsToModify =
    modifications.courts?.map((court) => court.courtId) || [];
  const courtIdsToDelete = existingCourtIds.filter(
    (courtId) => !courtIdsToModify.includes(courtId)
  );
  if (courtIdsToDelete.length) {
    const courtsToDelete = venue.courts.filter((court) =>
      courtIdsToDelete.includes(court.courtId)
    );
    const scheduleDeletionsCount = courtsToDelete
      .map((court) => {
        // check whether deleting court would remove schedule from any matchUps
        const result = getScheduledCourtMatchUps({
          courtId: court.courtId,
          tournamentRecord,
          venueMatchUps,
        });
        return result.matchUps?.length || 0;
      })
      .reduce((a, b) => a + b);

    if (!scheduleDeletionsCount || force) {
      venue.courts = venue.courts.filter((court) =>
        courtIdsToModify.includes(court.courtId)
      );
    } else {
      const info = deletionMessage({
        matchUpsCount: scheduleDeletionsCount,
      });
      return { error: info };
    }
  }

  if (modifications.courts) {
    for (const court of modifications.courts) {
      const { courtId } = court || {};
      let result = modifyCourt({
        modifications: court,
        disableNotice: true,
        tournamentRecord,
        venueMatchUps,
        courtId,
        force,
      });
      if (result.error === COURT_NOT_FOUND) {
        result = addCourt({
          disableNotice: true,
          tournamentRecord,
          venueId,
          court,
        });
      }
      if (result.error) return result;
    }
  }

  checkSchedulingProfile({ tournamentRecord });

  addNotice({
    payload: { venue, tournamentId: tournamentRecord.tournamentId },
    topic: MODIFY_VENUE,
    key: venue.venueId,
  });

  return { ...SUCCESS, venue: makeDeepCopy(venue) };
}

import { getScheduledCourtMatchUps } from '../queryGovernor/getScheduledCourtMatchUps';
import venueTemplate from '../../generators/venueTemplate';
import { addNotice } from '../../../global/globalState';
import { findVenue } from '../../getters/venueGetter';
import { deletionMessage } from './deletionMessage';
import { makeDeepCopy } from '../../../utilities';
import { modifyCourt } from './modifyCourt';
import { addCourt } from './addCourt';

import {
  COURT_NOT_FOUND,
  INVALID_OBJECT,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VENUE_ID,
  NO_VALID_ATTRIBUTES,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { MODIFY_VENUE } from '../../../constants/topicConstants';

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

  const { venue, error } = findVenue({ tournamentRecord, venueId });
  if (error) return { error };

  // not valid to modify a venueId
  const validAttributes = Object.keys(venueTemplate()).filter(
    (attribute) => attribute !== 'venueId'
  );
  const validModificationAttributes = Object.keys(
    modifications
  ).filter((attribute) => validAttributes.includes(attribute));

  if (!validModificationAttributes.length)
    return { error: NO_VALID_ATTRIBUTES };

  const validReplacements = validAttributes.filter(
    (attribute) => !['courts'].includes(attribute)
  );

  const validReplacementAttributes = Object.keys(
    modifications
  ).filter((attribute) => validReplacements.includes(attribute));

  validReplacementAttributes.forEach((attribute) =>
    Object.assign(venue, { [attribute]: modifications[attribute] })
  );

  const errors = [];
  const existingCourtIds = venue.courts.map((court) => court.courtId);
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
        const { matchUps } = getScheduledCourtMatchUps({
          tournamentRecord,

          courtId: court.courtId,
        });
        return matchUps.length;
      })
      .reduce((a, b) => a + b);

    if (!scheduleDeletionsCount || force) {
      venue.courts = venue.courts.filter((court) =>
        courtIdsToModify.includes(court.courtId)
      );
    } else {
      const message = deletionMessage({
        matchUpsCount: scheduleDeletionsCount,
      });
      errors.push(message);
    }
  }

  modifications.courts &&
    modifications.courts.forEach((court) => {
      const { courtId } = court || {};
      let result = modifyCourt({
        tournamentRecord,
        modifications: court,
        disableNotice: true,
        courtId,
        force,
      });
      if (result.error === COURT_NOT_FOUND) {
        result = addCourt({
          tournamentRecord,
          venueId,
          court,
          disableNotice: true,
        });
      }
      if (result.error) {
        if (result.error.errors) {
          result.error.errors.forEach((error) => errors.push(error));
        } else {
          errors.push(result);
        }
      }
    });

  if (errors.length) return { error: { errors } };

  addNotice({ topic: MODIFY_VENUE, payload: { venue } });

  return Object.assign({}, SUCCESS, { venue: makeDeepCopy(venue) });
}

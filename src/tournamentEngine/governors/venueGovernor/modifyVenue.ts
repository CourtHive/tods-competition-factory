import { bulkScheduleTournamentMatchUps } from '../scheduleGovernor/bulkScheduleTournamentMatchUps';
import { getAppliedPolicies } from '../../../query/extensions/getAppliedPolicies';
import { checkAndUpdateSchedulingProfile } from '../scheduleGovernor/schedulingProfile';
import { addNotice } from '../../../global/state/globalState';
import venueTemplate from '../../../assemblies/generators/templates/venueTemplate';
import { deletionMessage } from './deletionMessage';
import { makeDeepCopy } from '../../../utilities';
import { modifyCourt } from './modifyCourt';
import { addCourt } from './addCourt';
import {
  getScheduledCourtMatchUps,
  getScheduledVenueMatchUps,
} from '../../../query/venues/getScheduledCourtMatchUps';

import { POLICY_TYPE_SCHEDULING } from '../../../constants/policyConstants';
import { Tournament, Venue } from '../../../types/tournamentTypes';
import { MODIFY_VENUE } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  COURT_NOT_FOUND,
  ErrorType,
  INVALID_OBJECT,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VENUE_ID,
  NO_VALID_ATTRIBUTES,
} from '../../../constants/errorConditionConstants';
import { findVenue } from '../../../acquire/findVenue';

type ModifyVenueArgs = {
  tournamentRecord: Tournament;
  modifications: any;
  venueId: string;
  force?: boolean;
};
export function modifyVenue({
  tournamentRecord,
  modifications,
  venueId,
  force,
}: ModifyVenueArgs): { error?: ErrorType; success?: boolean; venue?: Venue } {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!modifications || typeof modifications !== 'object')
    return { error: INVALID_OBJECT };
  if (!venueId) return { error: MISSING_VENUE_ID };

  const appliedPolicies = getAppliedPolicies({
    tournamentRecord,
  })?.appliedPolicies;

  const allowModificationWhenMatchUpsScheduled =
    force ??
    appliedPolicies?.[POLICY_TYPE_SCHEDULING]?.allowDeletionWithScoresPresent
      ?.venues;

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

  venue &&
    validReplacementAttributes.forEach((attribute) =>
      Object.assign(venue, { [attribute]: modifications[attribute] })
    );

  const existingCourtIds = venue?.courts?.map((court) => court.courtId) ?? [];
  const courtIdsToModify =
    modifications.courts?.map((court) => court.courtId) || [];
  const courtIdsToDelete = existingCourtIds.filter(
    (courtId) => !courtIdsToModify.includes(courtId)
  );

  const matchUpsWithCourtId: { matchUpId: string; drawId: string }[] = [];
  if (courtIdsToDelete.length) {
    const courtsToDelete = venue?.courts?.filter((court) =>
      courtIdsToDelete.includes(court.courtId)
    );
    const scheduleDeletionsCount = courtsToDelete
      ?.map((court) => {
        // check whether deleting court would remove schedule from any matchUps
        const result = getScheduledCourtMatchUps({
          courtId: court.courtId,
          tournamentRecord,
          venueMatchUps,
        });
        for (const matchUp of result.matchUps ?? []) {
          matchUpsWithCourtId.push({
            matchUpId: matchUp.matchUpId,
            drawId: matchUp.drawId,
          });
        }
        return result.matchUps?.length ?? 0;
      })
      .reduce((a, b) => a + b);

    if (
      venue &&
      (!scheduleDeletionsCount || allowModificationWhenMatchUpsScheduled)
    ) {
      venue.courts = venue.courts?.filter((court) =>
        courtIdsToModify.includes(court.courtId)
      );
      bulkScheduleTournamentMatchUps({
        schedule: { courtId: '', scheduledDate: '' },
        matchUpDetails: matchUpsWithCourtId,
        removePriorValues: true,
        tournamentRecord,
      });
    } else {
      return deletionMessage({
        matchUpsCount: scheduleDeletionsCount,
      });
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

  checkAndUpdateSchedulingProfile({ tournamentRecord });

  if (venue) {
    addNotice({
      payload: { venue, tournamentId: tournamentRecord.tournamentId },
      topic: MODIFY_VENUE,
      key: venue?.venueId,
    });
  }

  return { ...SUCCESS, venue: makeDeepCopy(venue) };
}

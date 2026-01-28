import { getScheduledCourtMatchUps, getScheduledVenueMatchUps } from '@Query/venues/getScheduledCourtMatchUps';
import { bulkScheduleTournamentMatchUps } from '../matchUps/schedule/bulkScheduleTournamentMatchUps';
import { resolveTournamentRecords } from '@Helpers/parameters/resolveTournamentRecords';
import { deletionMessage } from '@Assemblies/generators/matchUps/deletionMessage';
import { checkAndUpdateSchedulingProfile } from '../tournaments/schedulingProfile';
import venueTemplate from '@Assemblies/generators/templates/venueTemplate';
import { getAppliedPolicies } from '@Query/extensions/getAppliedPolicies';
import { addNotice } from '@Global/state/globalState';
import { makeDeepCopy } from '@Tools/makeDeepCopy';
import { findVenue } from '@Query/venues/findVenue';
import { modifyCourt } from './modifyCourt';
import { addCourt } from './addCourt';

// constants and types
import { POLICY_TYPE_SCHEDULING } from '@Constants/policyConstants';
import { Venue, Tournament } from '@Types/tournamentTypes';
import { MODIFY_VENUE } from '@Constants/topicConstants';
import { TournamentRecords } from '@Types/factoryTypes';
import { SUCCESS } from '@Constants/resultConstants';
import {
  COURT_NOT_FOUND,
  ErrorType,
  INVALID_OBJECT,
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
  VENUE_NOT_FOUND,
  MISSING_VENUE_ID,
  NO_VALID_ATTRIBUTES,
} from '@Constants/errorConditionConstants';

type ModifyVenueArgs = {
  tournamentRecords?: TournamentRecords;
  tournamentRecord?: Tournament;
  modifications: any;
  venueId: string;
  force?: boolean;
};
export function modifyVenue(params: ModifyVenueArgs) {
  const { modifications, venueId, force } = params;

  const tournamentRecords = resolveTournamentRecords(params);

  if (!Object.keys(tournamentRecords).length) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof venueId !== 'string') return { error: MISSING_VENUE_ID };

  let error;
  let success;
  // in this case suppress NOT FOUND errors if there is at least one success
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = venueModify({
      tournamentRecord,
      modifications,
      venueId,
      force,
    });
    if (result.success) success = true;
    if (result.error) error = result.error;
    if (result.error && result.error !== VENUE_NOT_FOUND) return result;
  }

  checkAndUpdateSchedulingProfile({ tournamentRecords });

  return success ? { ...SUCCESS } : { error };
}

export function venueModify({ tournamentRecord, modifications, venueId, force }: ModifyVenueArgs): {
  error?: ErrorType;
  success?: boolean;
  venue?: Venue;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!modifications || typeof modifications !== 'object') return { error: INVALID_OBJECT };
  if (!venueId) return { error: MISSING_VENUE_ID };

  const appliedPolicies = getAppliedPolicies({
    tournamentRecord,
  })?.appliedPolicies;

  const allowModificationWhenMatchUpsScheduled =
    force ?? appliedPolicies?.[POLICY_TYPE_SCHEDULING]?.allowDeletionWithScoresPresent?.venues;

  const { matchUps: venueMatchUps } = getScheduledVenueMatchUps({
    tournamentRecord,
    venueId,
  });

  const result = findVenue({ tournamentRecord, venueId });
  if (result.error) return result;
  const venue = result.venue;

  // not valid to modify a venueId
  const validAttributes = Object.keys(venueTemplate()).filter((attribute) => attribute !== 'venueId');
  const validModificationAttributes = Object.keys(modifications).filter((attribute) =>
    validAttributes.includes(attribute),
  );

  if (!validModificationAttributes.length) return { error: NO_VALID_ATTRIBUTES };

  const validReplacements = validAttributes.filter((attribute) => !['courts', 'onlineResources'].includes(attribute));

  const validReplacementAttributes = Object.keys(modifications).filter((attribute) =>
    validReplacements.includes(attribute),
  );

  venue &&
    validReplacementAttributes.forEach((attribute) => Object.assign(venue, { [attribute]: modifications[attribute] }));

  const existingCourtIds = venue?.courts?.map((court) => court.courtId) ?? [];
  const courtIdsToModify = modifications.courts?.map((court) => court.courtId) || [];

  // courts will be deleted if courts array included in modifications
  const courtIdsToDelete = courtIdsToModify.length
    ? existingCourtIds.filter((courtId) => !courtIdsToModify.includes(courtId))
    : modifications?.courts && existingCourtIds;

  const matchUpsWithCourtId: { matchUpId: string; drawId: string }[] = [];
  if (courtIdsToDelete?.length) {
    const courtsToDelete = venue?.courts?.filter((court) => courtIdsToDelete.includes(court.courtId));
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
    if (venue && (!scheduleDeletionsCount || allowModificationWhenMatchUpsScheduled)) {
      venue.courts = venue.courts?.filter((court) => courtIdsToModify.includes(court.courtId));
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

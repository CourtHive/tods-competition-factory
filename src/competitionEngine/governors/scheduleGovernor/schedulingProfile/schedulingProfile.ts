import { validateSchedulingProfile } from '../../../../validators/validateSchedulingProfile';
import { getCompetitionVenues } from '../../../../query/venues/venuesAndCourtsGetter';
import { removeExtension } from '../../../../mutate/extensions/removeExtension';
import { getEventIdsAndDrawIds } from '../../../../query/tournaments/getEventIdsAndDrawIds';
import { addExtension } from '../../../../mutate/extensions/addExtension';
import { findExtension } from '../../../../acquire/findExtension';
import { extractDate } from '../../../../utilities/dateTime';

import { SCHEDULING_PROFILE } from '../../../../constants/extensionConstants';
import { TournamentRecords } from '../../../../types/factoryTypes';
import { SUCCESS } from '../../../../constants/resultConstants';
import { Tournament } from '../../../../types/tournamentTypes';
import {
  ErrorType,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../../constants/errorConditionConstants';

type GetSchedulingProfileArgs = {
  tournamentRecords?: TournamentRecords;
  tournamentRecord?: Tournament;
};

export function getSchedulingProfile({
  tournamentRecords,
  tournamentRecord,
}: GetSchedulingProfileArgs): {
  schedulingProfile?: any;
  modifications?: number;
  error?: ErrorType;
  issues?: string[];
} {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const { extension } = findExtension({
    element: tournamentRecord, // if tournamentRecord is provided, use it
    name: SCHEDULING_PROFILE,
    tournamentRecords,
    discover: true,
  });

  let schedulingProfile = extension?.value || [];

  if (schedulingProfile.length) {
    const { venueIds } = getCompetitionVenues({
      requireCourts: true,
      tournamentRecords,
    });
    const { eventIds, drawIds } = getEventIdsAndDrawIds({ tournamentRecords });

    const { updatedSchedulingProfile, modifications, issues } =
      getUpdatedSchedulingProfile({
        schedulingProfile,
        venueIds,
        eventIds,
        drawIds,
      });

    if (modifications) {
      schedulingProfile = updatedSchedulingProfile;
      const result = setSchedulingProfile({
        tournamentRecords,
        tournamentRecord,
        schedulingProfile,
      });
      if (result.error) return result;

      return { schedulingProfile, modifications, issues };
    }
  }

  return { schedulingProfile, modifications: 0 };
}

type SetSchedulingProfileArgs = {
  tournamentRecords: TournamentRecords;
  tournamentRecord?: Tournament;
  schedulingProfile?: any[];
};
export function setSchedulingProfile({
  tournamentRecords,
  tournamentRecord,
  schedulingProfile,
}: SetSchedulingProfileArgs) {
  const profileValidity = validateSchedulingProfile({
    tournamentRecords,
    schedulingProfile,
  });

  if (profileValidity.error) return profileValidity;

  if (!schedulingProfile)
    return removeExtension({
      element: tournamentRecord,
      name: SCHEDULING_PROFILE,
      tournamentRecords,
      discover: true,
    });

  const extension = {
    name: SCHEDULING_PROFILE,
    value: schedulingProfile,
  };

  return addExtension({ tournamentRecords, discover: true, extension });
}

export function getUpdatedSchedulingProfile({
  schedulingProfile,
  venueIds,
  eventIds,
  drawIds,
}) {
  const issues: string[] = [];
  const updatedSchedulingProfile = schedulingProfile
    ?.map((dateSchedulingProfile) => {
      const date = extractDate(dateSchedulingProfile?.scheduleDate);
      if (!date) {
        issues.push(`Invalid date: ${dateSchedulingProfile?.scheduledDate}`);
        return;
      }

      const venues = (dateSchedulingProfile?.venues || [])
        .map((venue) => {
          const { rounds, venueId } = venue;
          const venueExists = venueIds.includes(venueId);
          if (!venueExists) {
            issues.push(`Missing venueId: ${venueId}`);
            return;
          }

          const filteredRounds = rounds.filter((round) => {
            const validEventIdAndDrawId =
              eventIds.includes(round.eventId) &&
              drawIds.includes(round.drawId);
            if (!validEventIdAndDrawId)
              issues.push(
                `Invalid eventId: ${round.eventId} or drawId: ${round.drawId}`
              );
            return validEventIdAndDrawId;
          });

          if (!filteredRounds.length) return;

          return { venueId, rounds: filteredRounds };
        })
        .filter(Boolean);

      return venues.length && date && { ...dateSchedulingProfile, venues };
    })
    .filter(Boolean);

  const modifications = issues.length;
  return { updatedSchedulingProfile, modifications, issues };
}

export function checkSchedulingProfile({ tournamentRecords }) {
  const { schedulingProfile } = getSchedulingProfile({
    tournamentRecords,
  });
  if (schedulingProfile) {
    const { venueIds } = getCompetitionVenues({ tournamentRecords });
    const { eventIds, drawIds } = getEventIdsAndDrawIds({ tournamentRecords });
    const { updatedSchedulingProfile, modifications } =
      getUpdatedSchedulingProfile({
        schedulingProfile,
        venueIds,
        eventIds,
        drawIds,
      });

    if (modifications) {
      return setSchedulingProfile({
        tournamentRecords,
        schedulingProfile: updatedSchedulingProfile,
      });
    }
  }

  return { ...SUCCESS };
}

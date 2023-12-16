import { getUpdatedSchedulingProfile } from '../../../competitionEngine/governors/scheduleGovernor/schedulingProfile/schedulingProfile';
import { getEventIdsAndDrawIds } from '../../../competitionEngine/getters/getEventIdsAndDrawIds';
import { tournamentRelevantSchedulingIds } from '../../../validators/validateSchedulingProfile';
import { checkRequiredParameters } from '../../../parameters/checkRequiredParameters';
import { addTournamentExtension } from '../tournamentGovernor/addRemoveExtensions';
import { findExtension } from '../../../acquire/findExtension';

import { SCHEDULING_PROFILE } from '../../../constants/extensionConstants';
import { ErrorType } from '../../../constants/errorConditionConstants';
import { Tournament } from '../../../types/tournamentTypes';

export function setSchedulingProfile(params) {
  const paramCheck = checkRequiredParameters(params, [
    { tournamentRecord: true },
    { schedulingProfile: true, type: 'array' },
  ]);
  if (paramCheck.error) return paramCheck;

  const { tournamentRecord, schedulingProfile } = params;
  return checkSchedulingProfile({ tournamentRecord, schedulingProfile });
}

function saveSchedulingProfile({ tournamentRecord, schedulingProfile }) {
  const extension = {
    name: SCHEDULING_PROFILE,
    value: schedulingProfile,
  };
  return addTournamentExtension({ tournamentRecord, extension });
}

export function getSchedulingProfile(params): {
  schedulingProfile?: any;
  modifications?: number;
  issues?: string[];
  error?: ErrorType;
} {
  const paramCheck = checkRequiredParameters(params, [
    { tournamentRecord: true },
  ]);
  if (paramCheck.error) return paramCheck;

  const { tournamentRecord } = params;
  const tournamentId = tournamentRecord.tournamentId;

  const { extension } = findExtension({
    element: tournamentRecord,
    name: SCHEDULING_PROFILE,
  });

  let schedulingProfile = extension?.value || [];

  if (schedulingProfile.length) {
    const venueIds = tournamentRecord.venues?.map(
      ({ venueId, courts }) => courts?.length && venueId
    );
    const aggregator = getEventIdsAndDrawIds({
      tournamentRecords: { [tournamentId]: tournamentRecord },
    });

    const { eventIds, drawIds } = aggregator;

    const { updatedSchedulingProfile, modifications, issues } =
      getUpdatedSchedulingProfile({
        schedulingProfile,
        venueIds,
        eventIds,
        drawIds,
      });

    if (modifications) {
      schedulingProfile = updatedSchedulingProfile;
      const result = saveSchedulingProfile({
        tournamentRecord,
        schedulingProfile,
      });
      if (result.error) return result;

      return { schedulingProfile, modifications, issues };
    }
  }

  return { schedulingProfile, modifications: 0 };
}

type CheckSchedulingProfile = {
  tournamentRecord?: Tournament;
  schedulingProfile?: any[];
  requireCourts?: boolean;
};
export function checkSchedulingProfile({
  requireCourts = true,
  tournamentRecord,
  schedulingProfile,
}: CheckSchedulingProfile) {
  if (!schedulingProfile) {
    const { modifications, issues } = getSchedulingProfile({
      tournamentRecord,
    });
    return { success: !modifications, modifications, issues };
  }

  const { venueIds, eventIds, drawIds } = tournamentRelevantSchedulingIds({
    tournamentRecord,
    requireCourts,
  });
  const { modifications, issues } = getUpdatedSchedulingProfile({
    schedulingProfile,
    venueIds,
    eventIds,
    drawIds,
  });

  return { success: !modifications, modifications, issues };
}

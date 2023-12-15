import { getUpdatedSchedulingProfile } from '../../../competitionEngine/governors/scheduleGovernor/schedulingProfile/schedulingProfile';
import { tournamentRelevantSchedulingIds } from '../../../validators/validateSchedulingProfile';
import { getEventIdsAndDrawIds } from '../../../competitionEngine/getters/getEventIdsAndDrawIds';
import { addTournamentExtension } from '../tournamentGovernor/addRemoveExtensions';
import { findExtension } from '../../../acquire/findExtension';

import { SCHEDULING_PROFILE } from '../../../constants/extensionConstants';
import { Tournament } from '../../../types/tournamentTypes';
import {
  ErrorType,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function setSchedulingProfile({ tournamentRecord, schedulingProfile }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!Array.isArray(schedulingProfile)) return { error: INVALID_VALUES };
  return checkSchedulingProfile({ tournamentRecord, schedulingProfile });
}

function saveSchedulingProfile({ tournamentRecord, schedulingProfile }) {
  const extension = {
    name: SCHEDULING_PROFILE,
    value: schedulingProfile,
  };
  return addTournamentExtension({ tournamentRecord, extension });
}

export function getSchedulingProfile({ tournamentRecord }): {
  schedulingProfile?: any;
  modifications?: number;
  issues?: string[];
  error?: ErrorType;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
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

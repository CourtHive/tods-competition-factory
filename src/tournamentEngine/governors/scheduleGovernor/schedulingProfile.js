import { getUpdatedSchedulingProfile } from '../../../competitionEngine/governors/scheduleGovernor/schedulingProfile/schedulingProfile';
import { tournamentRelevantSchedulingIds } from '../../../global/validation/validSchedulingProfile';
import { addTournamentExtension } from '../tournamentGovernor/addRemoveExtensions';
import { findTournamentExtension } from '../queryGovernor/extensionQueries';

import { SCHEDULING_PROFILE } from '../../../constants/extensionConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function setSchedulingProfile({ tournamentRecord, schedulingProfile }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!Array.isArray(schedulingProfile)) return { error: INVALID_VALUES };

  const extension = {
    name: SCHEDULING_PROFILE,
    value: schedulingProfile,
  };
  return addTournamentExtension({ tournamentRecord, extension });
}

export function getSchedulingProfile({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { extension } = findTournamentExtension({
    tournamentRecord,
    name: SCHEDULING_PROFILE,
  });
  return { schedulingProfile: extension?.value || [] };
}

export function checkSchedulingProfile({ tournamentRecord }) {
  const { schedulingProfile } = getSchedulingProfile({ tournamentRecord });
  if (schedulingProfile) {
    const { venueIds, eventIds, drawIds } = tournamentRelevantSchedulingIds({
      tournamentRecord,
    });
    const { updatedSchedulingProfile, modified } = getUpdatedSchedulingProfile({
      schedulingProfile,
      venueIds,
      eventIds,
      drawIds,
    });

    if (modified) {
      return setSchedulingProfile({
        tournamentRecord,
        schedulingProfile: updatedSchedulingProfile,
      });
    }
  }

  return SUCCESS;
}

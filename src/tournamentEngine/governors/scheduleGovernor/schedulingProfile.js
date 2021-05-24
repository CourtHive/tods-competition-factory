import { getUpdatedSchedulingProfile } from '../../../competitionEngine/governors/scheduleGovernor/schedulingProfile';
import { validSchedulingProfile } from '../../../global/validation/validSchedulingProfile';
import { addTournamentExtension } from '../tournamentGovernor/addRemoveExtensions';
import { findTournamentExtension } from '../queryGovernor/extensionQueries';
import { getVenues } from '../../getters/venueGetter';

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

export function isValidSchedulingProfile({
  tournamentRecord,
  schedulingProfile,
}) {
  const { venues } = getVenues({ tournamentRecord });
  const venueIds = venues?.map(({ venueId }) => venueId);
  return validSchedulingProfile({ venueIds, schedulingProfile });
}

export function checkSchedulingProfile({ tournamentRecord }) {
  const { schedulingProfile } = getSchedulingProfile({ tournamentRecord });
  if (schedulingProfile) {
    const venueIds = (tournamentRecord.venues || []).map(
      ({ venueId }) => venueId
    );
    const events = tournamentRecord.events || [];
    const eventIds = events.map(({ eventId }) => eventId);
    const drawIds = events
      .map((event) => (event.drawDefinitions || []).map(({ drawId }) => drawId))
      .flat();
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

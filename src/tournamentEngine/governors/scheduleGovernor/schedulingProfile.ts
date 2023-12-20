import {
  getSchedulingProfile,
  getUpdatedSchedulingProfile,
} from '../../../competitionEngine/governors/scheduleGovernor/schedulingProfile/schedulingProfile';
import { tournamentRelevantSchedulingIds } from '../../../validators/validateSchedulingProfile';
import { Tournament } from '../../../types/tournamentTypes';

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

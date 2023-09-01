import { findPolicy } from '../../policyGovernor/findPolicy';
import {
  findEventExtension,
  findTournamentExtension,
} from '../../queryGovernor/extensionQueries';

import { POLICY_TYPE_SCHEDULING } from '../../../../constants/policyConstants';
import { SCHEDULE_TIMING } from '../../../../constants/extensionConstants';
import { Event, Tournament } from '../../../../types/tournamentFromSchema';

type GetScheduleTimingArgs = {
  tournamentRecord?: Tournament;
  categoryName?: string;
  categoryType?: string;
  event?: Event;
};
export function getScheduleTiming({
  tournamentRecord,
  categoryName,
  categoryType,
  event,
}: GetScheduleTimingArgs) {
  categoryName =
    categoryName ??
    event?.category?.categoryName ??
    event?.category?.ageCategoryCode;

  categoryType =
    categoryType ?? event?.category?.categoryType ?? event?.category?.subType;

  const { policy } = findPolicy({
    policyType: POLICY_TYPE_SCHEDULING,
    tournamentRecord,
    event,
  });

  const tournamentExtension = tournamentRecord
    ? findTournamentExtension({
        name: SCHEDULE_TIMING,
        tournamentRecord,
      }).extension
    : undefined;
  const tournamentScheduling = tournamentExtension?.value;

  const eventExtension =
    event &&
    findEventExtension({
      name: SCHEDULE_TIMING,
      event,
    }).extension;
  const eventScheduling = eventExtension?.value;

  const scheduleTiming = {
    tournamentScheduling,
    eventScheduling,
    categoryName,
    categoryType,
    policy,
  };

  return { scheduleTiming };
}

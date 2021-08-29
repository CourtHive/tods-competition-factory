import { findPolicy } from '../../policyGovernor/findPolicy';
import {
  findEventExtension,
  findTournamentExtension,
} from '../../queryGovernor/extensionQueries';

import { POLICY_TYPE_SCHEDULING } from '../../../../constants/policyConstants';
import { SCHEDULE_TIMING } from '../../../../constants/extensionConstants';

export function getScheduleTiming({
  tournamentRecord,
  categoryName,
  categoryType,
  event,
}) {
  categoryName =
    categoryName ||
    event?.category?.categoryName ||
    event?.category?.ageCategoryCode;

  categoryType = categoryType || event?.category?.categoryType;

  const { policy } = findPolicy({
    policyType: POLICY_TYPE_SCHEDULING,
    tournamentRecord,
    event,
  });

  const { extension: tournamentExtension } = findTournamentExtension({
    tournamentRecord,
    name: SCHEDULE_TIMING,
  });
  const tournamentScheduling = tournamentExtension?.value;

  const { extension: eventExtension } = findEventExtension({
    event,
    name: SCHEDULE_TIMING,
  });
  const eventScheduling = eventExtension?.value;

  const scheduleTiming = {
    categoryName,
    categoryType,
    eventScheduling,
    tournamentScheduling,
    policy,
  };

  return { scheduleTiming };
}

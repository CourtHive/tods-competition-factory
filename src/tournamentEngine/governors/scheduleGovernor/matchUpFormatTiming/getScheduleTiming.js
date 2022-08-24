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

  categoryType =
    categoryType || event?.category?.categoryType || event?.category?.subType;

  const { policy } = findPolicy({
    policyType: POLICY_TYPE_SCHEDULING,
    tournamentRecord,
    event,
  });

  const { extension: tournamentExtension } = findTournamentExtension({
    name: SCHEDULE_TIMING,
    tournamentRecord,
  });
  const tournamentScheduling = tournamentExtension?.value;

  const { extension: eventExtension } = findEventExtension({
    name: SCHEDULE_TIMING,
    event,
  });
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

import { scheduledMatchUpTime } from '../../accessors/matchUpAccessor/scheduledMatchUpTime';
import { scheduledMatchUpDate } from '../../accessors/matchUpAccessor/scheduledMatchUpDate';
import { matchUpAssignedCourtId } from '../../accessors/matchUpAccessor/courtAssignment';
import { matchUpAssignedVenueId } from '../../accessors/matchUpAccessor/venueAssignment';
import { extractDate, sameDay } from '../../../utilities/dateTime';

export function filterMatchUps(params) {
  const {
    stages,
    venueIds,
    courtIds,
    matchUps,
    matchUpIds,
    matchUpTypes,
    roundNumbers,
    matchUpFormat,
    collectionIds,
    scheduledDate,
    scheduledDates,
    isMatchUpTie,
    matchUpFormats,
    matchUpStatuses,
    isCollectionMatchUp,

    // only applies to inContext matchUps and only when processContext boolean is true
    processContext,
    tournamentIds,
    eventIds,
    drawIds,
    structureIds,

    filterMatchUpTypes = true,
  } = params;

  const targetMatchUpStatuses = Array.isArray(matchUpStatuses)
    ? matchUpStatuses.filter(Boolean)
    : [];

  const targetStages = Array.isArray(stages) ? stages.filter(Boolean) : [];
  const targetCollectionIds = Array.isArray(collectionIds)
    ? collectionIds.filter(Boolean)
    : [];
  const targetRoundNumbers = Array.isArray(roundNumbers)
    ? roundNumbers.filter(Boolean)
    : [];

  const targetMatchUpIds = Array.isArray(matchUpIds)
    ? matchUpIds.filter(Boolean)
    : [];
  const targetMatchUpTypes =
    Array.isArray(matchUpTypes) && filterMatchUpTypes
      ? matchUpTypes.filter(Boolean)
      : [];
  const targetCourtIds = Array.isArray(courtIds)
    ? courtIds.filter(Boolean)
    : [];
  const targetVenueIds = Array.isArray(venueIds)
    ? venueIds.filter(Boolean)
    : [];
  const targetMatchUpFormats = Array.isArray(matchUpFormats)
    ? matchUpFormats.filter(Boolean)
    : typeof matchUpFormat === 'string'
    ? [matchUpFormat]
    : [];
  const targetScheduledDates = Array.isArray(scheduledDates)
    ? scheduledDates.filter(Boolean)
    : typeof scheduledDate === 'string' && scheduledDate.length
    ? [scheduledDate]
    : [];

  const targetTournamentIds = Array.isArray(tournamentIds)
    ? tournamentIds.filter(Boolean)
    : [];
  const targetEventIds = Array.isArray(eventIds)
    ? eventIds.filter(Boolean)
    : [];
  const targetDrawIds = Array.isArray(drawIds) ? drawIds.filter(Boolean) : [];
  const targetStructureIds = Array.isArray(structureIds)
    ? structureIds.filter(Boolean)
    : [];

  const filteredMatchUps = matchUps.filter((matchUp) => {
    if (isMatchUpTie !== undefined) {
      if (isMatchUpTie && !matchUp.tieFormat) {
        return false;
      }
      if (
        !isMatchUpTie &&
        matchUp.tieFormat &&
        Object.keys(matchUp.tieFormat)?.length
      ) {
        return false;
      }
    }
    if (isCollectionMatchUp !== undefined) {
      if (isCollectionMatchUp && !matchUp.collectionId) {
        return false;
      }
      if (!isCollectionMatchUp && matchUp.collectionId) {
        return false;
      }
    }

    if (targetStages.length && !targetStages.includes(matchUp.stage)) {
      return false;
    }
    if (
      targetCollectionIds.length &&
      !targetCollectionIds.includes(matchUp.collectionId)
    ) {
      return false;
    }
    if (
      targetRoundNumbers.length &&
      !roundNumbers.includes(matchUp.roundNumber)
    ) {
      return false;
    }
    if (
      targetMatchUpStatuses.length &&
      !targetMatchUpStatuses.includes(matchUp.matchUpStatus)
    ) {
      return false;
    }
    if (
      targetMatchUpIds.length &&
      !targetMatchUpIds.includes(matchUp.matchUpId)
    ) {
      return false;
    }
    if (
      targetMatchUpTypes.length &&
      !targetMatchUpTypes.includes(matchUp.matchUpType)
    ) {
      return false;
    }
    if (
      targetMatchUpFormats.length &&
      !targetMatchUpFormats.includes(matchUp.matchUpFormat)
    ) {
      return false;
    }

    if (targetScheduledDates?.length) {
      const { scheduledTime } = scheduledMatchUpTime({
        matchUp,
      });
      const { scheduledDate: matchUpDate } = scheduledMatchUpDate({
        matchUp,
      });
      const scheduledTimeDate = extractDate(scheduledTime);
      const comparisonDate = scheduledTimeDate || matchUpDate;

      if (
        !targetScheduledDates.find((scheduledDate) =>
          sameDay(scheduledDate, comparisonDate)
        )
      )
        return false;
    }

    if (targetCourtIds.length) {
      const { courtId } = matchUpAssignedCourtId({ matchUp });
      if (!courtIds.filter(Boolean).includes(courtId)) {
        return false;
      }
    }

    if (targetVenueIds.length) {
      const { venueId } = matchUpAssignedVenueId({ matchUp });
      if (!venueIds.filter(Boolean).includes(venueId)) {
        return false;
      }
    }

    if (processContext) {
      if (
        targetTournamentIds.length &&
        !targetTournamentIds.includes(matchUp.tournamentId)
      ) {
        return false;
      }

      if (targetEventIds.length && !targetEventIds.includes(matchUp.eventId)) {
        return false;
      }

      if (targetDrawIds.length && !targetDrawIds.includes(matchUp.drawId)) {
        return false;
      }

      if (
        targetStructureIds.length &&
        !targetStructureIds.includes(matchUp.structureId)
      ) {
        return false;
      }
    }

    return true;
  });

  return filteredMatchUps;
}

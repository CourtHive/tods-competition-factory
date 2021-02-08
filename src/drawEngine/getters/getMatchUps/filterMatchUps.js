import { sameDay } from '../../../utilities/dateTime';
import { scheduledMatchUpTime } from '../../accessors/matchUpAccessor/scheduledTime';
import { scheduledMatchUpDate } from '../../accessors/matchUpAccessor/scheduledDate';
import { matchUpAssignedCourtId } from '../../accessors/matchUpAccessor/courtAssignment';

export function filterMatchUps({
  stages,
  courtIds,
  matchUps,
  matchUpTypes,
  roundNumbers,
  matchUpFormat,
  collectionIds,
  scheduledDate,
  isMatchUpTie,
  localTimeZone,
  matchUpFormats,
  matchUpStatuses,
  localPerspective,
  isCollectionMatchUp,
}) {
  const filteredMatchUps = matchUps.filter((matchUp) => {
    if (isMatchUpTie !== undefined) {
      if (isMatchUpTie && !matchUp.tieFormat) return false;
      if (!isMatchUpTie && matchUp.tieFormat) return false;
    }
    if (isCollectionMatchUp !== undefined) {
      if (isCollectionMatchUp && !matchUp.collectionId) return false;
      if (!isCollectionMatchUp && matchUp.collectionId) return false;
    }
    if (stages?.length && !stages.includes(matchUp.stage)) {
      return false;
    }
    if (
      collectionIds?.length &&
      !collectionIds.includes(matchUp.collectionId)
    ) {
      return false;
    }
    if (roundNumbers?.length && !roundNumbers.includes(matchUp.roundNumber)) {
      return false;
    }
    if (
      matchUpStatuses?.length &&
      !matchUpStatuses.includes(matchUp.matchUpStatus)
    ) {
      return false;
    }
    if (matchUpTypes?.length && !matchUpTypes.includes(matchUp.matchUpType)) {
      return false;
    }
    if (
      matchUpFormats?.length &&
      !matchUpFormats.includes(matchUp.matchUpFormat)
    ) {
      return false;
    }
    if (scheduledDate) {
      const { scheduledTime } = scheduledMatchUpTime({
        matchUp,
        localTimeZone,
        localPerspective,
      });
      const { scheduledDate: matchUpDate } = scheduledMatchUpDate({
        matchUp,
        localTimeZone,
        localPerspective,
      });
      const comparisonDate = scheduledTime || matchUpDate;
      if (!sameDay(scheduledDate, comparisonDate)) return false;
    }
    if (matchUpFormat && matchUp.matchUpFormat !== matchUpFormat) {
      return false;
    }
    if (courtIds) {
      const { courtId } = matchUpAssignedCourtId({ matchUp });
      if (!courtIds.includes(courtId)) {
        return false;
      }
    }

    return true;
  });

  return filteredMatchUps;
}

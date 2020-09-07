import { sameDay } from './sameDay';
import { scheduledMatchUpTime } from "src/drawEngine/accessors/matchUpAccessor";
import { scheduledMatchUpDate } from "src/drawEngine/accessors/matchUpAccessor";
import { matchUpAssignedCourtId } from 'src/drawEngine/accessors/matchUpAccessor/courtAssignment';

export function filterMatchUps({
  drawIds,
  courtIds,
  matchUps,
  structureIds,
  roundNumbers,
  matchUpFormat,
  collectionIds,
  scheduledDate,
  isMatchUpTie,
  isCollectionMatchUp,
}) {
  const filteredMatchUps = matchUps.filter(matchUp => {
    if (isMatchUpTie !== undefined) {
      if (isMatchUpTie && !matchUp.tieFormat) return false;
      if (!isMatchUpTie && matchUp.tieFormat) return false;
    } 
    if (isCollectionMatchUp !== undefined) {
      if (isCollectionMatchUp && !matchUp.collectionId) return false;
      if (!isCollectionMatchUp && matchUp.collectionId) return false;
    } 
    if (drawIds && drawIds.length && !drawIds.includes(matchUp.drawId)) { return false; }
    if (collectionIds && collectionIds.length && !collectionIds.includes(matchUp.collectionId)) { return false; }
    if (structureIds && structureIds.length && !structureIds.includes(matchUp.structureId)) { return false; }
    if (roundNumbers && roundNumbers.length && !roundNumbers.includes(matchUp.roundNumber)) { return false; }
    if (scheduledDate) {
      const { scheduledTime } = scheduledMatchUpTime({matchUp});
      const { scheduledDate: matchUpDate } = scheduledMatchUpDate({matchUp});
      const comparisonDate = scheduledTime || matchUpDate;
      if (!sameDay(scheduledDate, comparisonDate)) return false;
    }
    if (matchUpFormat && matchUp.matchUpFormat !== matchUpFormat) { return false; }
    if (courtIds) {
      const { courtId } = matchUpAssignedCourtId({matchUp});
      if (!courtIds.includes(courtId)) { return false; }
    }

    return true;
  });

  return filteredMatchUps;
}
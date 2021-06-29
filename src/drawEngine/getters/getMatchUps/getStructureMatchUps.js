import { matchUpIsComplete } from '../../governors/scoreGovernor/matchUpIsComplete';
import { getAllStructureMatchUps } from './getAllStructureMatchUps';
import { structureAssignedDrawPositions } from '../positionsGetter';
import { findStructure } from '../findStructure';

import {
  ABANDONED,
  upcomingMatchUpStatuses,
} from '../../../constants/matchUpStatusConstants';
import { TEAM } from '../../../constants/matchUpTypes';

/*
  completedMatchUps are those matchUps where a winningSide is defined
  upcomingMatchUps are those matchUps where both drawPositions are defined
  ===> If requireParticipants then upcmoingMatchUps require drawPositions to be assigned
  pendingMatchUps are those matchUps where a drawPosition is undefined
  *AND* where both drawPositions map to assigned participantIds
*/
export function getStructureMatchUps({
  context,
  inContext,
  structure,
  roundFilter,
  structureId,
  drawDefinition,
  matchUpFilters,
  contextFilters,
  policyDefinition,
  tournamentParticipants,
  tournamentAppliedPolicies,
  requireParticipants = true,
  scheduleVisibilityFilters,

  matchUpsMap,
}) {
  if (!structure && structureId) {
    ({ structure } = findStructure({ drawDefinition, structureId }));
  }
  const { matchUps, error } = getAllStructureMatchUps({
    context,
    structure,
    inContext,
    drawDefinition,
    matchUpFilters,
    contextFilters,
    policyDefinition,
    tournamentParticipants,
    tournamentAppliedPolicies,
    scheduleVisibilityFilters,

    matchUpsMap,
  });
  if (error) return { error };
  const { assignedPositions } = structureAssignedDrawPositions({ structure });
  const participantAssignedDrawPositions = assignedPositions
    .filter((assignment) => assignment.participantId)
    .map((assignment) => assignment.drawPosition);

  const byeMatchUps = [];
  const pendingMatchUps = [];
  const upcomingMatchUps = [];
  const abandonedMatchUps = [];
  const completedMatchUps = [];

  matchUps
    .filter((matchUp) => {
      const teamsMatchUpsOnly =
        matchUpFilters?.matchUpTypes?.length === 1 &&
        matchUpFilters.matchUpTypes[0] === TEAM;
      return matchUp.matchUpType !== TEAM && teamsMatchUpsOnly ? false : true;
    })
    .forEach((matchUp) => {
      if (matchUp.matchUpStatus === ABANDONED) {
        abandonedMatchUps.push(matchUp);
        return;
      }

      const isCollectionMatchUp = matchUp.collectionId;
      const collectionSidesAssigned =
        isCollectionMatchUp &&
        matchUp.sides.reduce((assigned, side) => {
          return side.participantId && assigned;
        }, true);

      const roundFilterEquality = matchUp.roundNumber === roundFilter;

      const drawPositionsFilled =
        !isCollectionMatchUp &&
        matchUp.drawPositions?.filter((f) => f).length === 2;
      const drawPositionsAssigned =
        !isCollectionMatchUp &&
        matchUp.drawPositions?.reduce((assigned, drawPosition) => {
          return (
            participantAssignedDrawPositions.includes(drawPosition) && assigned
          );
        }, true);

      const byeAssignedDrawPositions = assignedPositions
        .filter((assignment) => assignment.bye)
        .map((assignment) => assignment.drawPosition);

      const isByeMatchUp =
        !isCollectionMatchUp &&
        matchUp.drawPositions?.reduce((isByeMatchUp, drawPosition) => {
          return (
            byeAssignedDrawPositions.includes(drawPosition) || isByeMatchUp
          );
        }, false);

      const validUpcomingMatchUpStatus = upcomingMatchUpStatuses.includes(
        matchUp.matchUpStatus
      );
      const isUpcomingMatchUp =
        validUpcomingMatchUpStatus &&
        (collectionSidesAssigned ||
          (drawPositionsFilled &&
            (!roundFilter || roundFilterEquality) &&
            (!requireParticipants || drawPositionsAssigned)));

      if (isByeMatchUp) return byeMatchUps.push(matchUp);
      if (matchUpIsComplete(matchUp)) return completedMatchUps.push(matchUp);
      if (isUpcomingMatchUp) return upcomingMatchUps.push(matchUp);
      return pendingMatchUps.push(matchUp);
    });

  return {
    completedMatchUps,
    upcomingMatchUps,
    pendingMatchUps,
    abandonedMatchUps,
    byeMatchUps,
    structure,
  };
}

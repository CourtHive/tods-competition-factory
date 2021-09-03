import { matchUpIsComplete } from '../../governors/scoreGovernor/matchUpIsComplete';
import { getAllStructureMatchUps } from './getAllStructureMatchUps';
import { structureAssignedDrawPositions } from '../positionsGetter';
import { findStructure } from '../findStructure';

import { TEAM } from '../../../constants/matchUpTypes';
import {
  ABANDONED,
  upcomingMatchUpStatuses,
} from '../../../constants/matchUpStatusConstants';

/*
  completedMatchUps are those matchUps where a winningSide is defined
  upcomingMatchUps are those matchUps where both drawPositions are defined
  ===> If requireParticipants then upcmoingMatchUps require drawPositions to be assigned
  pendingMatchUps are those matchUps where a drawPosition is undefined
  *AND* where both drawPositions map to assigned participantIds
*/
export function getStructureMatchUps({
  event,
  context,
  inContext,
  structure,
  roundFilter,
  structureId,
  drawDefinition,
  matchUpFilters,
  contextFilters,
  scheduleTiming,
  policyDefinitions,
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
    event,
    context,
    structure,
    inContext,
    drawDefinition,
    matchUpFilters,
    contextFilters,
    scheduleTiming,
    policyDefinitions,
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
        matchUp.sides.every((side) => side.participantId);

      const roundFilterEquality = matchUp.roundNumber === roundFilter;

      const drawPositionsFilled =
        !isCollectionMatchUp &&
        matchUp.drawPositions?.filter(Boolean).length === 2;
      const drawPositionsAssigned =
        !isCollectionMatchUp &&
        matchUp.drawPositions?.every((drawPosition) =>
          participantAssignedDrawPositions.includes(drawPosition)
        );

      const byeAssignedDrawPositions = assignedPositions
        .filter((assignment) => assignment.bye)
        .map((assignment) => assignment.drawPosition);

      const isByeMatchUp =
        !isCollectionMatchUp &&
        matchUp.drawPositions?.find((drawPosition) =>
          byeAssignedDrawPositions.includes(drawPosition)
        );

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

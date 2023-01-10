import { getTeamLineUp } from './drawDefinitions/getTeamLineUp';

import { INVALID_VALUES } from '../../../constants/errorConditionConstants';

// NOTE: do not remove participantIds for which there has been a substitution
export function removeCollectionAssignments({
  collectionPosition,
  teamParticipantId,
  dualMatchUpSide,
  drawDefinition,
  participantIds,
  collectionId,
}) {
  if (!collectionId || !collectionPosition || !Array.isArray(participantIds))
    return {
      error: INVALID_VALUES,
      modifiedLineUp: dualMatchUpSide?.lineUp || [],
    };

  const lineUp =
    dualMatchUpSide?.lineUp ||
    getTeamLineUp({
      participantId: teamParticipantId,
      drawDefinition,
    })?.lineUp;

  const assignmentsRemoved = [];

  const modifiedLineUp =
    lineUp
      ?.map((teamCompetitor) => {
        if (!participantIds.includes(teamCompetitor.participantId)) {
          return teamCompetitor;
        }
        const collectionAssignments =
          teamCompetitor.collectionAssignments?.filter((assignment) => {
            const target =
              assignment.collectionId === collectionId &&
              assignment.collectionPosition === collectionPosition;
            if (target)
              assignmentsRemoved.push({
                participantId: teamCompetitor.participantId,
                ...assignment,
              });
            return !target;
          });
        return {
          participantId: teamCompetitor.participantId,
          collectionAssignments,
        };
      })
      .filter(Boolean) || [];

  return { modifiedLineUp, assignmentsRemoved };
}

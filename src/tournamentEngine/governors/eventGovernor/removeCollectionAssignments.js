import { INVALID_VALUES } from '../../../constants/errorConditionConstants';

export function removeCollectionAssignments({
  collectionPosition,
  dualMatchUpSide,
  participantIds,
  collectionId,
}) {
  if (
    !collectionId ||
    !collectionPosition ||
    !dualMatchUpSide ||
    !Array.isArray(participantIds)
  )
    return {
      error: INVALID_VALUES,
      modifiedLineUp: dualMatchUpSide?.lineUp || [],
    };

  const modifiedLineUp =
    dualMatchUpSide?.lineUp
      ?.map((teamCompetitor) => {
        if (!participantIds.includes(teamCompetitor.participantId)) {
          return teamCompetitor;
        }
        const collectionAssignments =
          teamCompetitor.collectionAssignments?.filter((assignment) => {
            const target =
              assignment.collectionId === collectionId &&
              assignment.collectionPosition === collectionPosition;
            return !target;
          });
        return {
          participantId: teamCompetitor.participantId,
          collectionAssignments,
        };
      })
      .filter(Boolean) || [];

  return { modifiedLineUp };
}

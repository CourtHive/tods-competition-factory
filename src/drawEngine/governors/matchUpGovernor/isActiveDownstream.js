import { getMappedStructureMatchUps } from '../../getters/getMatchUps/getMatchUpsMap';
import { intersection } from '../../../utilities';

// to support removal of DOUBLE_WALKOVERs this needs to identify WALKOVERs which are created by WO/WO
// to determine if "truly" active it needs to look beyond the WALKOVER matchUp with only one drawPosition
export function isActiveDownstream(params) {
  const {
    inContextMatchUp,
    inContextDrawMatchUps,
    targetData,
    structure,
    matchUpsMap,
  } = params;

  const {
    targetMatchUps: { loserMatchUp, winnerMatchUp },
  } = targetData;

  const inContextWinnerMatchUp = inContextDrawMatchUps.find(
    ({ matchUpId }) => matchUpId === winnerMatchUp?.matchUpId
  );
  const structureMatchUps = getMappedStructureMatchUps({
    matchUpsMap,
    structureId: structure?.structureId,
  });

  // if neither loserMatchUp or winnerMatchUp have winningSide
  // => score matchUp and advance participants along links
  const matchUpParticipantIds =
    inContextMatchUp?.sides?.map(({ participantId }) => participantId) || [];

  const loserMatchUpHasWinningSide = loserMatchUp?.winningSide;
  const loserMatchUpParticipantIds =
    loserMatchUp?.sides?.map(({ participantId }) => participantId) || [];
  const loserMatchUpParticipantIntersection = !!intersection(
    matchUpParticipantIds,
    loserMatchUpParticipantIds
  ).length;

  const winnerMatchUpInSameStructure =
    winnerMatchUp?.matchUpId &&
    inContextWinnerMatchUp?.matchUpId === winnerMatchUp?.matchUpId;

  const completedWithRelevantDrawPositions = !!structureMatchUps?.filter(
    (matchUp) => {
      return (
        matchUp.roundNumber > inContextMatchUp.roundNumber &&
        matchUp.drawPositions.length > 1 &&
        intersection(inContextMatchUp.drawPositions, matchUp.drawPositions)
          .length &&
        matchUp.winningSide
      );
    }
  ).length;

  const winnerMatchUpHasWinningSide = winnerMatchUp?.winningSide;
  const winnerMatchUpParticipantIds =
    winnerMatchUp?.sides?.map(({ participantId }) => participantId) || [];
  const winnerMatchUpParticipantIntersection = !!intersection(
    matchUpParticipantIds,
    winnerMatchUpParticipantIds
  ).length;

  // matchUp is active downstream if:
  // 1. the loserMatchUp has a winningSide and participantIds intersect with matchUpParticipantIds
  // 2. winnerMmatchUp is in the same structure and matchUp drawPositions are in subsequent completed matchUp
  // 3. winnerMatchhUp is (potentially) in a different strcuture and participantIds intersect matchUpParticipantIds

  const loserActiveDownstream =
    loserMatchUpHasWinningSide && loserMatchUpParticipantIntersection;
  const winnerInCompletedSubsequentMatchUp =
    winnerMatchUpInSameStructure && completedWithRelevantDrawPositions;
  const winnerActiveDownstream =
    winnerMatchUpHasWinningSide && winnerMatchUpParticipantIntersection;

  const activeDownstream =
    loserActiveDownstream ||
    winnerInCompletedSubsequentMatchUp ||
    winnerActiveDownstream;

  return activeDownstream;
}

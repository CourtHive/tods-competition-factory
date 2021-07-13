import { intersection } from '../../../utilities';

export function isActiveDownstream({ inContextMatchUp, targetData }) {
  const {
    targetMatchUps: { loserMatchUp, winnerMatchUp },
  } = targetData;

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
  const winnerMatchUpHasWinningSide = winnerMatchUp?.winningSide;
  const winnerMatchUpParticipantIds =
    winnerMatchUp?.sides?.map(({ participantId }) => participantId) || [];
  const winnerMatchUpParticipantIntersection = !!intersection(
    matchUpParticipantIds,
    winnerMatchUpParticipantIds
  ).length;

  const activeDownstream =
    (loserMatchUpHasWinningSide && loserMatchUpParticipantIntersection) ||
    (winnerMatchUpHasWinningSide && winnerMatchUpParticipantIntersection);

  return activeDownstream;
}

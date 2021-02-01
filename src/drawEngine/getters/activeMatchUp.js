import { isActiveMatchUpStatus } from '../governors/matchUpGovernor/checkStatusType';

export function isActiveMatchUp({ score, winningSide, matchUpStatus }) {
  return (
    score?.scoreStringSide1 ||
    winningSide ||
    isActiveMatchUpStatus({ matchUpStatus })
  );
}

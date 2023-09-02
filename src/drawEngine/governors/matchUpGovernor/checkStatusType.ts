import {
  nonDirectingMatchUpStatuses,
  directingMatchUpStatuses,
  activeMatchUpStatuses,
} from '../../../constants/matchUpStatusConstants';
import { MatchUpStatusEnum } from '../../../types/tournamentFromSchema';

export function isDirectingMatchUpStatus({ matchUpStatus }) {
  return directingMatchUpStatuses.includes(matchUpStatus);
}

export function isActiveMatchUpStatus({ matchUpStatus }) {
  return activeMatchUpStatuses.includes(matchUpStatus);
}

type IsNonDirectingArgs = {
  matchUpStatus: MatchUpStatusEnum;
};
export function isNonDirectingMatchUpStatus({
  matchUpStatus,
}: IsNonDirectingArgs) {
  return nonDirectingMatchUpStatuses.includes(matchUpStatus);
}

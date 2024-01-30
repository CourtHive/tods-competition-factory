import { MatchUpStatusUnion } from '../../types/tournamentTypes';
import {
  nonDirectingMatchUpStatuses,
  directingMatchUpStatuses,
  activeMatchUpStatuses,
} from '@Constants/matchUpStatusConstants';

export function isDirectingMatchUpStatus({ matchUpStatus }) {
  return directingMatchUpStatuses.includes(matchUpStatus);
}

export function isActiveMatchUpStatus({ matchUpStatus }) {
  return activeMatchUpStatuses.includes(matchUpStatus);
}

type IsNonDirectingArgs = {
  matchUpStatus: MatchUpStatusUnion;
};
export function isNonDirectingMatchUpStatus({ matchUpStatus }: IsNonDirectingArgs) {
  return nonDirectingMatchUpStatuses.includes(matchUpStatus);
}

import {
  directingMatchUpStatuses,
  activeMatchUpStatuses,
  nonDirectingMatchUpStatuses,
} from '../../../constants/matchUpStatusConstants';

export function isDirectingMatchUpStatus({ matchUpStatus }) {
  return directingMatchUpStatuses.includes(matchUpStatus);
}

export function isActiveMatchUpStatus({ matchUpStatus }) {
  return activeMatchUpStatuses.includes(matchUpStatus);
}

export function isNonDirectingMatchUpStatus({ matchUpStatus }) {
  return nonDirectingMatchUpStatuses.includes(matchUpStatus);
}

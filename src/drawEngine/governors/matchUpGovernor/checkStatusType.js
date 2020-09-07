import {
  TO_BE_PLAYED,                 // no participant advancement
  NOT_PLAYED, ABANDONED,        // no participant advancement
  IN_PROGRESS, SUSPENDED,       // no participant advancement
  BYE, COMPLETED, RETIRED, WALKOVER, DEFAULTED // advancement
} from 'src/constants/matchUpStatusConstants';

export function isDirectingMatchUpStatus({matchUpStatus}) {
  return [BYE, COMPLETED, RETIRED, WALKOVER, DEFAULTED]
    .includes(matchUpStatus);
}

export function isNonDirectingMatchUpStatus({matchUpStatus}) {
  return [TO_BE_PLAYED, NOT_PLAYED, ABANDONED, IN_PROGRESS, SUSPENDED ]
    .includes(matchUpStatus);
}

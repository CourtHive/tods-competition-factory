import { DEFAULTED, RETIRED, WALKOVER } from '@Constants/matchUpStatusConstants';

export function isExit(matchUpStatus: any): boolean {
  return [DEFAULTED, WALKOVER, RETIRED].includes(matchUpStatus);
}

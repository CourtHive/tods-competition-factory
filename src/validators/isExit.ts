import { DEFAULTED, WALKOVER } from '@Constants/matchUpStatusConstants';

export function isExit(matchUpStatus: any): boolean {
  return [DEFAULTED, WALKOVER].includes(matchUpStatus);
}

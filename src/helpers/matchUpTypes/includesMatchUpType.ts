import { matchUpTypeMap } from './matchUpTypeMap';

export function includesMatchUpType(matchUpType) {
  return matchUpTypeMap[matchUpType].includes(matchUpType);
}

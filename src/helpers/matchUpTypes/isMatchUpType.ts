import { matchUpTypeMap } from './matchUpTypeMap';

export const isMatchUpType =
  (type) =>
  ({ matchUpType }) =>
    matchUpTypeMap[type].includes(matchUpType);

import { getTieMatchUpContext } from './getTieMatchUpContext';

import { SUCCESS } from '../../../constants/resultConstants';

export function replaceTieMatchUpParticipantId(params) {
  const result = getTieMatchUpContext(params);
  if (result.error) return result;

  return { ...SUCCESS };
}

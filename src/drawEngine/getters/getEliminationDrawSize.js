import { INVALID_VALUES } from '../../constants/errorConditionConstants';

export function getEliminationDrawSize({ participantCount }) {
  if (isNaN(participantCount)) return { error: INVALID_VALUES };
  const drawSize =
    [0, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024].find(
      (drawSize) => drawSize >= participantCount
    ) || 0;
  return drawSize;
}

import { UNGROUPED, UNPAIRED } from '../constants/entryStatusConstants';

export function isUngrouped(entryStatus) {
  return [UNPAIRED, UNGROUPED].includes(entryStatus);
}

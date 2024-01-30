import { eligibleEntryStage } from '../positionActions/getValidAlternatesAction';
import { getParticipantId } from '../../../functions/global/extractors';

import { ALTERNATE } from '@Constants/entryStatusConstants';

export function getEventAlternateParticipantIds({ eventEntries, structure }) {
  const eligibleAlternate = (entry) => entry.entryStatus === ALTERNATE && eligibleEntryStage({ structure, entry });
  const entryPositionSort = (a, b) => (a.entryPosition || Infinity) - (b.entryPosition || Infinity);

  return eventEntries.filter(eligibleAlternate).sort(entryPositionSort).map(getParticipantId);
}

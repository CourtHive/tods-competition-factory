import { eligibleEntryStage } from '../positionActions/getValidAlternatesAction';
import { xa } from '../../../utilities/objects';

import { ALTERNATE } from '../../../constants/entryStatusConstants';

export function getEventAlternateParticipantIds({ eventEntries, structure }) {
  const eligibleAlternate = (entry) => entry.entryStatus === ALTERNATE && eligibleEntryStage({ structure, entry });
  const entryPositionSort = (a, b) => (a.entryPosition || Infinity) - (b.entryPosition || Infinity);

  return eventEntries.filter(eligibleAlternate).sort(entryPositionSort).map(xa('participantId'));
}

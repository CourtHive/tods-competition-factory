import { destroyPairEntries, destroyPairEntry } from '../../../mutate/entries/destroyPairEntry';
import { setEntryPosition, setEntryPositions } from '../../../mutate/entries/setEntryPositions';
import { promoteAlternate, promoteAlternates } from '../../../mutate/entries/promoteAlternate';
import { removeDrawEntries } from '../../../mutate/drawDefinitions/removeDrawEntries';
import { modifyEntriesStatus } from '../../../mutate/entries/modifyEntriesStatus';
import { addEventEntryPairs } from '../../../mutate/entries/addEventEntryPairs';
import { removeEventEntries } from '../../../mutate/entries/removeEventEntries';
import { modifyEventEntries } from '../../../mutate/entries/modifyEventEntries';
import { addDrawEntries } from '../../../mutate/drawDefinitions/addDrawEntries';
import { addEventEntries } from '../../../mutate/entries/addEventEntries';

export const entriesGovernor = {
  addDrawEntries,
  addEventEntries,
  addEventEntryPairs,
  destroyPairEntries,
  destroyPairEntry,
  modifyEntriesStatus,
  modifyEventEntries,
  removeDrawEntries,
  removeEventEntries,
  setEntryPosition,
  setEntryPositions,
  promoteAlternate,
  promoteAlternates,
};

export default entriesGovernor;

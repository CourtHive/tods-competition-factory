/*
  Manages entries into drawDefinitions
  Insures entries do not exceed drawPositions specified for stage
  Insures entries may not be removed if participants are active in draw
  Insures entries may not be removed if draw stage is active
*/

import { assignSeed } from './seedAssignment';

import {
  setStageDrawSize,
  setStageAlternates,
  setStageWildcardsCount,
  setStageQualifiersCount,
} from './stageEntryCounts';
import { addEntry, addDrawEntries } from './addingDrawEntries';
import { removeEntry } from './removingDrawEntries';

const entryGovernor = {
  addEntry,
  addDrawEntries,
  assignSeed,
  removeEntry,

  setStageDrawSize,
  setStageAlternates,
  setStageWildcardsCount,
  setStageQualifiersCount,
};

export default entryGovernor;

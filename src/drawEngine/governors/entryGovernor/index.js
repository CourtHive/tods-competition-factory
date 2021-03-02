/*
  Manages entries into drawDefinitions
  Insures entries do not exceed drawPositions specified for stage
  Insures entries may not be removed if participants are active in draw
  Insures entries may not be removed if draw stage is active
*/

import { addDrawEntry, addDrawEntries } from './addingDrawEntries';
import { modifySeedAssignment } from './modifySeedAssignment';
import { removeEntry } from './removeEntry';
import { assignSeed } from './seedAssignment';
import {
  setStageQualifiersCount,
  setStageWildcardsCount,
  setStageAlternates,
  setStageDrawSize,
} from './stageEntryCounts';

const entryGovernor = {
  addDrawEntry,
  addDrawEntries,
  assignSeed,
  removeEntry,

  setStageDrawSize,
  setStageAlternates,
  setStageWildcardsCount,
  setStageQualifiersCount,
  modifySeedAssignment,
};

export default entryGovernor;

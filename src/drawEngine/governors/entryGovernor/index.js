/*
  Manages entries into drawDefinitions
  ensures entries do not exceed drawPositions specified for stage
  ensures entries may not be removed if participants are active in draw
  ensures entries may not be removed if draw stage is active
*/

import { addDrawEntry, addDrawEntries } from './addDrawEntries';
import { modifySeedAssignment } from './modifySeedAssignment';
import { updateTeamLineUp } from './updateTeamLineUp';
import { getTeamLineUp } from './getTeamLineUp';
import { assignSeed } from './seedAssignment';
import { removeEntry } from './removeEntry';
import {
  setStageQualifiersCount,
  setStageWildcardsCount,
  setStageAlternatesCount,
  setStageDrawSize,
} from './stageEntryCounts';

const entryGovernor = {
  addDrawEntry,
  addDrawEntries,
  assignSeed,
  removeEntry,

  setStageDrawSize,
  setStageAlternatesCount,
  setStageWildcardsCount,
  setStageQualifiersCount,
  modifySeedAssignment,

  updateTeamLineUp,
  getTeamLineUp,
};

export default entryGovernor;

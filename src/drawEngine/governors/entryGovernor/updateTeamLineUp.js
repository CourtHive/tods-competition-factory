import { findExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';

import { LINEUP } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_PARTICIPANT_ID,
} from '../../../constants/errorConditionConstants';

export function updateTeamLineUp({ drawDefinition, participantId, lineUp }) {
  if (typeof lineUp !== 'object') return { error: INVALID_VALUES };
  if (typeof participantId !== 'string')
    return { error: MISSING_PARTICIPANT_ID };

  const { extension } = findExtension({ drawDefinition, name: LINEUP });
  return { ...SUCCESS, extension };
}

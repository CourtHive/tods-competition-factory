import { addDrawDefinitionExtension } from '../../tournamentGovernor/addRemoveExtensions';
import { intersection } from '../../../../utilities';

import {
  DRAW_DEFINITION_NOT_FOUND,
  INVALID_VALUES,
} from '../../../../constants/errorConditionConstants';

export function setDrawParticipantRepresentativeIds({
  representativeParticipantIds,
  drawDefinition,
}) {
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };
  if (!Array.isArray(representativeParticipantIds))
    return { error: INVALID_VALUES };

  const enteredParticipantIds = (drawDefinition?.entries || [])
    ?.map(({ participantId }) => {
      participantId;
    })
    .filter((f) => f);

  // An empty array is valid; if ids provided...
  // check that all representativeParticipantIds are enteredParticipantIds
  if (
    representativeParticipantIds.length &&
    intersection(representativeParticipantIds, enteredParticipantIds).length <
      representativeParticipantIds.length
  ) {
    return { error: INVALID_VALUES };
  }

  const extension = {
    name: 'participantRepresentatives',
    value: representativeParticipantIds,
  };
  return addDrawDefinitionExtension({ drawDefinition, extension });
}

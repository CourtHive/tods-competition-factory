import { removeDirectedParticipants } from './removeDirectedParticipants';
import { isCompletedStructure } from '../queryGovernor/structureActions';
import { isDirectingMatchUpStatus } from './checkStatusType';
import { directParticipants } from './directParticipants';
import { getAffectedTargetStructureIds } from './getAffectedTargetStructureIds';

import { COMPLETED } from '../../../constants/matchUpStatusConstants';
import { WIN_RATIO } from '../../../constants/drawDefinitionConstants';

export function attemptToSetWinningSide(props) {
  const {
    drawDefinition,
    matchUpStatus,
    matchUpStatusCodes,
    winningSide,
    structure,
    matchUp,
  } = props;
  let errors = [];

  if (matchUp.winningSide && matchUp.winningSide !== winningSide) {
    // check whether player movement is dependent on win ratio
    if (structure.finishingPosition === WIN_RATIO) {
      const structureIsComplete = isCompletedStructure({
        drawDefinition,
        structure,
      });
      if (structureIsComplete) {
        // if structure is complete then a changed outcome will have downstream effects
        const { structureIds } = getAffectedTargetStructureIds({
          drawDefinition,
          structure,
          matchUp,
        });
        if (structureIds?.length) {
          console.log('affects:', { structureIds });
        }
      }
    }

    const { errors: participantDirectionErrors } = removeDirectedParticipants(
      props
    );

    if (participantDirectionErrors) {
      errors = errors.concat(participantDirectionErrors);
      return { errors };
    }
  }

  // TESTED
  const { errors: participantDirectionErrors } = directParticipants(props);

  if (participantDirectionErrors) {
    errors = errors.concat(participantDirectionErrors);
    // TESTED
  } else {
    // check that matchUpStatus is not incompatible with winningSide
    if (matchUpStatus && isDirectingMatchUpStatus({ matchUpStatus })) {
      matchUp.matchUpStatus = matchUpStatus || COMPLETED;
      matchUp.matchUpStatusCodes = matchUpStatus && matchUpStatusCodes;
      // TESTED
    } else {
      // determine appropriate matchUpStatus;
      matchUp.matchUpStatus = COMPLETED;
      matchUp.matchUpStatusCodes = matchUpStatusCodes;
      // TESTED
    }
  }

  return { errors };
}

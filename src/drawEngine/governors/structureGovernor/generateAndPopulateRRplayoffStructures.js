import { automatedPlayoffPositioning } from '../../../tournamentEngine/governors/eventGovernor/automatedPositioning';
import { findExtension } from '../../../global/functions/deducers/findExtension';
import { processPlayoffGroups } from '../../generators/processPlayoffGroups';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { getMatchUpId } from '../../../global/functions/extractors';
import { generateTieMatchUps } from '../../generators/tieMatchUps';

import { TEAM_MATCHUP } from '../../../constants/matchUpTypes';
import { TALLY } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function generateAndPopulateRRplayoffStructures(params) {
  const stack = 'generateAndPopulateRRplayoffStructures';
  if (!params.finishingPositionProfiles) {
    return decorateResult({
      info: 'finishingPositionProfiles required',
      result: { error: MISSING_VALUE },
      stack,
    });
  }
  const {
    finishingPositionProfiles: playoffGroups,
    playoffFinishingPositionRanges,
    // finishingPositionsAvailable,
    // finishingPositionsPlayedOff,
    sourceStructureId,
    groupCount,
    groupSize,
    event,
  } = params;

  const positionRangeMap = playoffFinishingPositionRanges.reduce(
    (positionMap, positionDetail) => {
      positionMap[positionDetail.finishingPosition] = positionDetail;
      return positionMap;
    },
    {}
  );
  const validFinishingPositions = playoffGroups?.every((profile) => {
    const { finishingPositions } = profile;
    return finishingPositions.every((position) => positionRangeMap[position]);
  });

  if (!validFinishingPositions) {
    return decorateResult({
      context: { validFinishingPositions: Object.values(positionRangeMap) },
      result: { error: INVALID_VALUES },
      stack,
    });
  }

  const {
    structures: playoffStructures,
    // finishingPositionTargets,
    links: playoffLinks,
  } = processPlayoffGroups({
    sourceStructureId,
    playoffGroups,
    groupCount,
    groupSize,
    ...params,
  });

  const drawDefinition = params.drawDefinition;

  drawDefinition.structures.push(...playoffStructures);
  drawDefinition.links.push(...playoffLinks);

  const { matchUps: inContextDrawMatchUps, matchUpsMap } = getAllDrawMatchUps({
    includeByeMatchUps: true,
    inContext: true,
    drawDefinition,
  });

  const newStructureIds = playoffStructures.map(
    ({ structureId }) => structureId
  );
  const addedMatchUpIds = inContextDrawMatchUps
    .filter(({ structureId }) => newStructureIds.includes(structureId))
    .map(getMatchUpId);

  const addedMatchUps = matchUpsMap?.drawMatchUps?.filter(({ matchUpId }) =>
    addedMatchUpIds.includes(matchUpId)
  );

  if (addedMatchUps.length) {
    const tieFormat = drawDefinition.tieFormat || event?.tieFormat || undefined;

    if (tieFormat) {
      addedMatchUps.forEach((matchUp) => {
        const { tieMatchUps } = generateTieMatchUps({
          isMock: params.isMock,
          tieFormat,
        });
        Object.assign(matchUp, { tieMatchUps, matchUpType: TEAM_MATCHUP });
      });
    }
  }

  // TODO: determine participants that are present in each playoffGroup.finishingPositions
  // OPTIONALLY: populate positionAssignments for newly generated structures

  const { positionAssignments } = getPositionAssignments({
    structureId: sourceStructureId,
    drawDefinition,
  });
  const finishingPositionParticipantIds = {};
  positionAssignments.forEach((assignment) => {
    const {
      extension: { value: participantResult },
    } = findExtension({
      element: assignment,
      name: TALLY,
    });
    const groupOrder = participantResult?.groupOrder;
    if (groupOrder) {
      if (!finishingPositionParticipantIds[groupOrder])
        finishingPositionParticipantIds[groupOrder] = [];
      finishingPositionParticipantIds[groupOrder].push(
        assignment.participantId
      );
    }
  });

  /*
  finishingPositionTargets.forEach((target) => {
    const { finishingPositions, structureId } = target;
    const participantIds = finishingPositions
      .flatMap((position) => finishingPositionParticipantIds[position] || [])
      .sort();
    console.log({ structureId, participantIds });
    const stageEntries = getStageEntries({
      drawDefinition,
      structureId,
      stage: 'PLAY_OFF',
    });
    console.log(stageEntries.map((p) => p.participantId).sort());
  });
  */

  const result = automatedPlayoffPositioning({
    provisionalPositioning: params.provisionalPositioning,
    structureId: sourceStructureId,
    applyPositioning: true,
    event: params.event,
    drawDefinition,
  });
  if (result.error) return decorateResult({ result, stack });

  return {
    structures: playoffStructures,
    links: playoffLinks,
    drawDefinition,
    ...SUCCESS,
  };
}

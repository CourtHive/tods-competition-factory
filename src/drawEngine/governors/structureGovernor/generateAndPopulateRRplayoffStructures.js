import { automatedPlayoffPositioning } from '../../../tournamentEngine/governors/eventGovernor/automatedPositioning';
import { getTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/getTieFormat';
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
  INCOMPLETE_SOURCE_STRUCTURE,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function generateAndPopulateRRplayoffStructures(params) {
  const stack = 'generateAndPopulateRRplayoffStructures';
  if (!params.playoffGroups) {
    return decorateResult({
      result: { error: MISSING_VALUE },
      info: 'playoffGroups required',
      stack,
    });
  }
  const {
    sourceStructureId,
    requireSequential,
    drawDefinition,
    playoffGroups,
    groupCount,
    groupSize,
    event,
  } = params;

  const {
    structures: playoffStructures = [],
    links: playoffLinks = [],
    finishingPositionTargets,
    positionRangeMap,
    error,
  } = processPlayoffGroups({
    requireSequential,
    sourceStructureId,
    playoffGroups,
    groupCount,
    groupSize,
    ...params,
  });

  if (error) return { error };

  const positionsPlayedOff = finishingPositionTargets
    ?.map(({ finishingPositions }) => finishingPositions)
    .flat()
    .map(
      (finishingPosition) =>
        positionRangeMap[finishingPosition].finishingPositions
    )
    .flat();

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
    const tieFormat = getTieFormat({ drawDefinition, event })?.tieFormat;

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
    const result = findExtension({
      element: assignment,
      name: TALLY,
    });
    const participantResult = result?.extension?.value;
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

  // attempt automated positioning but fail silently if source structure is incomplete
  if (result.error && result.error?.code !== INCOMPLETE_SOURCE_STRUCTURE.code) {
    return decorateResult({ result, stack });
  }

  return {
    structures: playoffStructures,
    links: playoffLinks,
    positionsPlayedOff,
    drawDefinition,
    ...SUCCESS,
  };
}

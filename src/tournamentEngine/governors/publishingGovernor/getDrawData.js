import { getAllStructureMatchUps } from '../../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { getStructureSeedAssignments } from '../../../drawEngine/getters/getStructureSeedAssignments';
import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { findStructure } from '../../../drawEngine/getters/findStructure';
import { structureSort } from '../../../drawEngine/getters/structureSort';
import { hasParticipantId } from '../../../global/functions/filters';
import { findExtension } from '../queryGovernor/extensionQueries';
import { getStructureGroups } from './getStructureGroups';
import { makeDeepCopy } from '../../../utilities';

import { TALLY } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_DRAW_DEFINITION,
  UNLINKED_STRUCTURES,
} from '../../../constants/errorConditionConstants';
import {
  ABANDONED,
  BYE,
  CANCELLED,
  COMPLETED,
  DEFAULTED,
  DOUBLE_DEFAULT,
  DOUBLE_WALKOVER,
  IN_PROGRESS,
  RETIRED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';
import {
  CONSOLATION,
  MAIN,
  PLAY_OFF,
  QUALIFYING,
} from '../../../constants/drawDefinitionConstants';

export function getDrawData({
  tournamentParticipants = [],
  includePositionAssignments,
  policyDefinitions,
  tournamentRecord,
  inContext = true,
  drawDefinition,
  noDeepCopy,
  sortConfig,
  context,
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const drawInfo = (({
    matchUpFormat,
    updatedAt,
    drawType,
    drawName,
    drawId,
  }) => ({
    matchUpFormat,
    updatedAt,
    drawName,
    drawType,
    drawId,
  }))(drawDefinition);

  let mainStageSeedAssignments, qualificationStageSeedAssignments;
  const {
    allStructuresLinked,
    sourceStructureIds,
    hasDrawFeedProfile,
    structureGroups,
  } = getStructureGroups({
    drawDefinition,
  });

  if (!allStructuresLinked) {
    const error = { error: UNLINKED_STRUCTURES };
    return { error };
  }

  let drawActive = false;
  let participantPlacements = false; // if any positionAssignments include a participantId
  const groupedStructures = structureGroups.map((structureIds) => {
    const completedStructures = {};
    const structures = structureIds
      .map((structureId) => {
        const { structure } = findStructure({ drawDefinition, structureId });
        const { seedAssignments } = getStructureSeedAssignments({
          drawDefinition,
          structure,
          event,
        });

        // capture the seedAssignments for MAIN/QUALIFYING { stageSequence: 1 }
        if (structure.stage === MAIN && structure.stageSequence === 1) {
          mainStageSeedAssignments = seedAssignments;
        }
        if (structure.stage === QUALIFYING && structure.stageSequence === 1) {
          qualificationStageSeedAssignments = seedAssignments;
        }

        return structure;
      })
      .sort((a, b) => structureSort(a, b, sortConfig))
      .map((structure) => {
        const { structureId } = structure;
        let seedAssignments = [];

        // pass seedAssignments from { stageSequence: 1 } to other stages
        if ([MAIN, CONSOLATION, PLAY_OFF].includes(structure.stage)) {
          seedAssignments = mainStageSeedAssignments;
        }

        if (structure.stage === QUALIFYING) {
          seedAssignments = qualificationStageSeedAssignments;
        }

        const { matchUps, roundMatchUps, roundProfile } =
          getAllStructureMatchUps({
            // only propagate seedAssignments where none are present
            seedAssignments: !structure?.seedAssignments?.length
              ? seedAssignments
              : undefined,
            context: { drawId: drawInfo.drawId, ...context },
            tournamentParticipants,
            policyDefinitions,
            tournamentRecord,
            drawDefinition,
            inContext,
            structure,
            event,
          });

        const { positionAssignments } = getPositionAssignments({
          structure,
        });

        const participantResults = positionAssignments
          .filter(hasParticipantId)
          .map((assignment) => {
            participantPlacements = true;
            const { drawPosition, participantId } = assignment;
            const { extension } = findExtension({
              element: assignment,
              name: TALLY,
            });
            return (
              extension && {
                drawPosition,
                participantId,
                participantResult: extension.value,
              }
            );
          })
          .filter((f) => f?.participantResult);

        const structureInfo = (({
          stageSequence,
          structureName,
          structureType,
          matchUpFormat,
          stage,
        }) => ({
          stageSequence,
          structureName,
          structureType,
          matchUpFormat,
          stage,
        }))(structure);

        structureInfo.sourceStructureIds = sourceStructureIds[structureId];
        structureInfo.hasDrawFeedProfile = hasDrawFeedProfile[structureId];
        structureInfo.positionAssignments = positionAssignments;

        structureInfo.structureActive = matchUps.reduce((active, matchUp) => {
          const activeMatchUpStatus = [
            COMPLETED,
            CANCELLED,
            DEFAULTED,
            RETIRED,
            WALKOVER,
            IN_PROGRESS,
            DOUBLE_DEFAULT,
            DOUBLE_WALKOVER,
          ].includes(matchUp.matchUpStatus);
          return (
            active ||
            activeMatchUpStatus ||
            !!matchUp.winningSide ||
            !!matchUp.score?.scoreStringSide1
          );
        }, false);

        const structureCompleted = matchUps.reduce((completed, matchUp) => {
          return (
            completed &&
            [BYE, COMPLETED, RETIRED, WALKOVER, DEFAULTED, ABANDONED].includes(
              matchUp.matchUpStatus
            )
          );
        }, !!matchUps.length);
        structureInfo.structureCompleted = structureCompleted;
        completedStructures[structureId] = structureCompleted;

        if (structureInfo.structureActive) drawActive = true;

        return {
          ...structureInfo,
          participantResults,
          seedAssignments,
          roundMatchUps,
          roundProfile,
          structureId,
        };
      });

    // cleanup attribute used for sorting
    structures.forEach((structure) => {
      if (!includePositionAssignments) delete structure.positionAssignments;
      structure.sourceStructuresComplete = structure.sourceStructureIds?.every(
        (id) => completedStructures[id]
      );
    });

    return structures;
  });

  const structures = groupedStructures.flat();

  drawInfo.drawActive = drawActive;
  drawInfo.participantPlacements = participantPlacements;
  drawInfo.drawGenerated = structures?.reduce((generated, structure) => {
    return generated || !!structure?.roundMatchUps;
  }, false);
  drawInfo.drawCompleted = structures?.reduce(
    (completed, structure) => completed && structure.structureCompleted,
    true
  );

  return {
    structures: noDeepCopy ? structures : makeDeepCopy(structures, false, true),
    drawInfo: noDeepCopy ? drawInfo : makeDeepCopy(drawInfo, false, true),
    ...SUCCESS,
  };
}
